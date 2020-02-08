import React from 'react'

import DataControl from './DataControl'
import Histogram from './Histogram'

class App extends React.Component {
  constructor(props) {
    super(props);
    // The length determines how many subjects can be compared.
    this.initial_selected_subjects = ["", "", "", ""];
    this.state = {
      reports: null,
      selected_report_type: "",
      selected_survey: "",
      selected_subjects: this.initial_selected_subjects
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const target = event.target;
    const type = target.dataset.type;
    if (type === "report") {
      this.setState({
        selected_report_type: target.value,
        selected_survey: "",
        selected_subjects: this.initial_selected_subjects
      });
    } else if (type === "survey") {
      this.setState({
        selected_survey: target.value,
        selected_subjects: this.initial_selected_subjects
      });
    } else if (type === "subject") {
      const selected_subjects = [...this.state.selected_subjects];
      selected_subjects[parseInt(target.dataset.ordinal)] = event.target.value;
      this.setState({ selected_subjects });
    }
  }

  componentDidMount() {
    fetch("/student-survey.json")
    .then(response => response.json())
    .then(data => {
      const new_state = {
        reports: data['reports'],
        selected_report_type: Object.keys(data['reports'])[1],
        selected_subjects: [...this.initial_selected_subjects]
      };
      new_state.selected_survey = Object.keys(new_state.reports[new_state.selected_report_type])[1];
      const subjects = Object.keys(new_state.reports[new_state.selected_report_type][new_state.selected_survey]);
      new_state.selected_subjects[0] = subjects[0];
      new_state.selected_subjects[1] = subjects[1];
      this.setState(new_state);
    });
  }

  calculateDiffScore(series) {
    let score = 0;
    const to_process = [...series];
    const num_elements = to_process.length;
    let cur  = undefined;
    while ((cur = to_process.shift()) !== undefined) {
      to_process.forEach(e => {
        for (let i = 0; i < cur.data.length; i++) {
          const diff = cur.data[i] - e.data[i];
          score += (diff * diff)/num_elements;
        }
      });
    }
    return score;
  }

  makeGraphs(reports) {
    const graphs = [];
    if (reports === null) {
      graphs.push(<div key="ruh-roh">Data loading. please wait.</div>);
    } else {
      // [ { question, data: {xlabel, ylabel, series: [a,b,c]}}
      const all_question_data = {};

      // Iterate over all selected schools and group data by question
      // into all_question_data.
      this.state.selected_subjects.forEach(school => {
        const report = reports[this.state.selected_report_type];
        if (!report) return;
        const survey = report[this.state.selected_survey];
        if (!survey) return;
        const school_data = survey[school];
        if (!school_data) return;

        Object.keys(school_data).forEach(question => {
          const responses = school_data[question];

          // Calculate percents.
          const total_respondents = responses.answer_respondents.reduce((a, n) => a+n, 0);

          // Set the data.
          let data = all_question_data[question];
          if (data === undefined) {
            data = {
              categories: responses.answers,
              xlabel: 'Rating',
              ylabel: '%',
              series: []
            };

            all_question_data[question] = data;
          }
          data.series.push({
            name: school,
            data: responses.answer_respondents.map(v => Math.round(v * 1000 / total_respondents)/10),
            tooltip: {
              footerFormat: `n = ${total_respondents}`
            }
          });
        });
      });

      const sorted_questions = [];
      for (let [question, data] of Object.entries(all_question_data)) {
        sorted_questions.push({
          question,
          data,
          difference_score: this.calculateDiffScore(data.series)
        });
      }
      sorted_questions.sort((a,b) => b.difference_score - a.difference_score);

      sorted_questions.forEach( q => {
        graphs.push(
          <Histogram key={q.question} data={q.data} title={q.question} diff_score={q.difference_score} />
        );
      });
    }
    return graphs;
  }

  render() {
    const graphs = this.makeGraphs(this.state.reports);
    return (
      <main className="app-main">
        <header className="mdc-toolbar top-bar">
          <div className="title-box">
            <h4 className="title">Seattle Public Schools Panorama Comparison Tool, 2019 data</h4>
          </div>
          <DataControl
            data={this.state.reports}
            report_type={this.state.selected_report_type}
            survey={this.state.selected_survey}
            subjects={this.state.selected_subjects}
            onChange={this.handleChange}
          />
        </header>
        <div className="">
          <section className="title-details">
              Data taken from the <a href="https://www.seattleschools.org/district/district_scorecards/school_surveys">SPS Panorama</a> site. Graphs are in pecentages. Hover over data series for population size. When multiple series are selected, graphs are sorted to show questions with *most different* responses first.
          </section>
          <div className="app-flex-root">
            <div className="app-flex-content">
                  {graphs}
              </div>
          </div>
        </div>
      </main>
    );
  }
}

export default App;
