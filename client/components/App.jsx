import React from 'react'

import DataControl from './DataControl'
import Histogram from './Histogram'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      schools: ["waiting for data"],
      surveys: ["waiting for data"],
      data: {},
      selected_schools: [
        "Adams Elementary"
      ]
    };

    this.handleSchoolChange = this.handleSchoolChange.bind(this);
  }

  handleSchoolChange(event) {
  }

  componentDidMount() {
    fetch("/student-survey.json")
    .then(response => response.json())
    .then(data => {
      this.setState({
        schools: data['subject_names'],
        surveys: data['surveys'],
        data });
    });
  }

  makeGraphs(values) {
    const graphs = [];
    if (values === undefined) {
      graphs.push(<div key="ruh-roh">Data loading. please wait.</div>);
    } else {
      const school = this.state.selected_schools[0];
      const school_data = values['School Report']['3-5 Student Survey'][school];
      const questions = Object.keys(school_data);
      const question = questions[0];
      const responses = school_data[question];
      const data = {
        categories: responses.answers,
        xlabel: 'Rating',
        ylabel: 'Respondents',
        series: []
      };
      data.series.push({
        name: school,
        data: responses.answer_respondents
      });
      graphs.push(
        <Histogram key="1" data={data} title={question} />
      );
    }
    return graphs;
  }

  render() {
    let graphs = (<div>Uh oh. Couldn't load data. Are you authorized?</div>);
    graphs = this.makeGraphs(this.state.data['reports']);
    return (
      <div className="app-flex-root">
        <div className="app-flex-content mdc-toolbar-fixed-adjust">
          <nav className="mdc-drawer mdc-permanent-drawer mdc-typography app-nav">
            <DataControl
              school1="Adams"
              onSchoolChange={this.handleSchoolChange}
              surveys={this.state.surveys}
              schools={this.state.schools}
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
