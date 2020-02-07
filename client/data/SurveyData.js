class SurveyData {
  // Takes survey data in the structure of
  // {
  //   header: ["column1", "column2", "column3"]
  //   data: { id1: [col1val, col2val, col3val],
  //           id2: [col1val, col2val, col3val]
  //          }
  // }
  constructor(survey_data) {
    this.headers = {};
    survey_data.header.map((value, index) => this.headers[value] = index);
    this.data = {};

    // Only keep the first entry from the same IP.
    // Only keep entries with complete data.
    const user_ip_index = this.headers['User IP']; 
    const negative_now_index = this.getNowIndex('Negative');
    const negative_entered_index = this.getEnteredIndex('Negative');
    const suicidal_now_index = this.getNowIndex('Suicidal');
    const suicidal_entered_index = this.getEnteredIndex('Suicidal');
    const ips_seen = {};
    Object.entries(survey_data.data).forEach(
      ([entry_id, row]) => {
        if (row[negative_entered_index] !== null &&
            row[negative_now_index] !== null &&
            row[suicidal_entered_index] !== null &&
            row[suicidal_now_index] !== null) {
          const ip = row[user_ip_index];
          if (!(ip in ips_seen)) {
            ips_seen[ip] = 1;
            this.data[entry_id] = row;
          }
        }
      });

    // Cache metadata header indexes.
    this.is_midaged_male_index = this.headers['male ages 36-64'];
    this.is_mental_health_provider_index = this.headers['mental health provider'];
    this.is_other_healthcare_provider_index = this.headers['other healthcare provider'];
    this.entry_date_index = this.headers['Entry Date'];
    
    // Memoization fields.
    this.deltas = {};
    this.correlations = {};
    this.enteredNowValues = {};
    this.enteredValues = {};
    this.nowValues = {};
  }

  get(entry_id, column_name) {
    return this.data[entry_id][this.header[column_name]];
  }

  getEntryMetadata(row) {
    return {
      is_midaged_male: row[this.is_midaged_male_index],
      is_mental_health_provider: row[this.is_mental_health_provider_index],
      is_other_healthcare_provider: row[this.is_other_healthcare_provider_index],
      entry_date: new Date(row[this.entry_date_index]),
    };
  }

  getEnteredIndex(category) { return this.headers[`Entered-${category}`]; }
  getNowIndex(category) { return this.headers[`Now-${category}`]; }

  getEnteredNowValues(category) {
    if (this.enteredNowValues[category]) {
      return this.enteredNowValues[category];
    }
    const results = this.enteredNowValues[category] = {
      got_better: [],
      got_worse: [],
    };
    const enter_index = this.getEnteredIndex(category);
    const now_index = this.getNowIndex(category);
    Object.entries(this.data).forEach(
      ([entry_id, row]) => {
        const entered = row[enter_index];
        const now = row[now_index];
        if ((entered !== null && now != null) && entered !== now) {
          const is_better = now < entered;
          const low = is_better ? now : entered;
          const high = is_better ? entered : now;
          const datum = [entry_id.toString(), low, high];
          if (is_better) {
            results.got_better.push(datum);
          } else {
            results.got_worse.push(datum);
          }
        }
      }
    );
    
    const sort_func = (a, b) => {
      if (a[2] < b[2]) {
        return 1;
      } else if (a[2] > b[2]) {
        return -1;
      } else {
        if (a[1] < b[1]) {
          return -1;
        } else if (a[1] > b[1]) {
          return 1;
        }
      }
      return 0;
    };

    results.got_better.sort(sort_func);
    results.got_worse.sort(sort_func);

    return results;
  }

  getValues(category, demographics, source_url) {
    demographics = demographics || {
      mhprov: true,
      otherprov: true,
      male36_64: true,
      uncategorized: true
    };
    source_url = source_url || '';

    const memoize_key = category + demographics.mhprov + demographics.otherprov + demographics.male36_64 + demographics.uncategorized + source_url;

    if (this.enteredValues[memoize_key]) {
      return this.enteredValues[memoize_key];
    }
    const results = this.enteredValues[memoize_key] = [];
    const enter_index = this.getEnteredIndex(category);
    const now_index = this.getNowIndex(category);
    const source_url_index = this.headers['Source Url'];
    const survey_time_index = this.headers['Survey Time'];
    Object.entries(this.data).forEach(
      ([entry_id, row]) => {
        const entry = this.getEntryMetadata(row);
        const matches_demographics = (
          (demographics.male36_64 && entry.is_midaged_male) ||
          (demographics.mhprov && entry.is_mental_health_provider) ||
          (demographics.otherprov && entry.is_other_healthcare_provider) ||
          (demographics.uncategorized && !entry.is_midaged_male && !entry.is_mental_health_provider && !entry.is_other_healthcare_provider));
        if (matches_demographics && row[source_url_index].startsWith(source_url)) {
          entry.id = entry_id;
          entry.now = row[now_index];
          entry.enter = row[enter_index];
          entry.survey_time = row[survey_time_index];
          results.push(entry);
        }
      }
    );
    return results;
  }

  getNowValues(category) {
    if (this.nowValues[category]) {
      return this.nowValues[category];
    }
    const results = this.nowValues[category] = [];
    const now_index = this.getNowIndex(category);
    Object.entries(this.data).forEach(
      ([entry_id, row]) => {
        results.push(row[now_index] || 'none');
      }
    );
    return results;
  }

  // Returns delta between "Entered" and "Now" for the given category.
  // Category can be one of "Negative" or "Suicidal".
  calculateDeltas(category) {
    // Memoize!
    if (this.deltas[category]) {
      return this.deltas[category];
    }
    const deltas = this.deltas[category] = [];
    const enter_index = this.getEnteredIndex(category);
    const now_index = this.getNowIndex(category);
    Object.entries(this.data).forEach(
      ([entry_id, row]) => {
        const entered = row[enter_index];
        const now = row[now_index];
        if (entered && now) {
          deltas.push(Object.assign(
            {
              val: now - entered,
              label: entry_id
            },
            this.getEntryMetadata(row)
          ));
        }
      }
    );

    // Return data sorted by deltas.
    deltas.sort((a, b) => {
      if (a.val < b.val)
        return -1;
      if (a.val > b.val) 
        return 1;
      return 0;
    });

    return deltas;
  }

  // Returns a 2-D array of correlations between "Entered" and "Now"
  // response values for the given attribute filters.
  // Category can be one of "Negative" or "Suicidal". The other attributes
  // are booleans.
  getCorrelations(category, is_mental_health_provider, is_other_healthcare_provider, is_midaged_male) {
    const memoization_key = category + !!is_mental_health_provider + !!is_other_healthcare_provider + !!is_mental_health_provider;
    if (this.correlations[memoization_key]) {
      return this.correlations[memoization_key];
    }

    const correlations = this.correlations[memoization_key] = { table:[] }
    // Initialize array.
    for (let entered = 0; entered < 5; entered++) {
      correlations.table[entered] = [];
      for (let now = 0; now < 5; now++) {
        correlations.table[entered][now] = 0;
      }
    }

    // Go through data and tabulate.
    const enter_index = this.getEnteredIndex(category);
    const now_index = this.getNowIndex(category);
    let total_entries = 0;
    let max_value = 0;
    Object.entries(this.data).forEach(
      ([_, row]) => {
        const entry_metadata = this.getEntryMetadata(row);
        const entered = row[enter_index];
        const now = row[now_index];
        if (entered && now &&
            entry_metadata.is_midaged_male == is_midaged_male &&
            entry_metadata.is_mental_health_provider == is_mental_health_provider &&
            entry_metadata.is_other_healthcare_provider == is_other_healthcare_provider) {
             const cur_val = ++correlations.table[entered-1][now-1];
             if (cur_val > max_value)
               max_value = cur_val;
             total_entries++;
        }
      }
    );

    correlations.is_other_healthcare_provider = is_other_healthcare_provider;
    correlations.is_mental_health_provider = is_mental_health_provider;
    correlations.is_midaged_male = is_midaged_male;
    correlations.total_entries = total_entries;
    correlations.max_value = max_value;
    return correlations;
  }
}

export default SurveyData;
