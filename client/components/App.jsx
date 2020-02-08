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
      this.setState({
        reports: data['reports'] });
    });
  }

  makeGraphs(reports) {
    const graphs = [];
    if (reports === null) {
      graphs.push(<div key="ruh-roh">Data loading. please wait.</div>);
    } else {
      const data = {
        xlabel: 'Rating',
        ylabel: '%',
        series: []
      };
      let question = "";
      this.state.selected_subjects.forEach( school => {
        const report = reports[this.state.selected_report_type];
        if (!report) return;
        const survey = report[this.state.selected_survey];
        if (!survey) return;
        const school_data = survey[school];
        if (!school_data) return;

        const questions = Object.keys(school_data);
        question = questions[0];
        const responses = school_data[question];

        // Calculate percents.
        const total_respondents = responses.answer_respondents.reduce((a, n) => a+n, 0);

        // Set the data.
        data.categories = responses.answers;
        data.series.push({
          name: school,
          data: responses.answer_respondents.map(v => Math.round(v * 1000 / total_respondents)/10)
        });
      });
      graphs.push(
        <Histogram key="1" data={data} title={question} />
      );
    }
    return graphs;
  }

  render() {
    const graphs = this.makeGraphs(this.state.reports);
    return (
      <div className="app-flex-root">
        <div className="app-flex-content mdc-toolbar-fixed-adjust">
          <nav className="mdc-drawer mdc-permanent-drawer mdc-typography app-nav">
            <DataControl
              data={this.state.reports}
              report_type={this.state.selected_report_type}
              survey={this.state.selected_survey}
              subjects={this.state.selected_subjects}
              onChange={this.handleChange}
              />
          </nav>
          <main className="app-main">
            {graphs}
          </main>
        </div>
      </div>
    );
  }
}

export default App;
