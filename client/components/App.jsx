import React from 'react'

import LoginBar from './LoginBar'

import CorrelationGraph from './CorrelationGraph'
import DeltaGraph from './DeltaGraph'
import DataControl from './DataControl'
import DescriptiveStats from './DescriptiveStats'
import EnterNowHistogram from './EnterNowHistogram'
import PairedEnterNowHistogram from './PairedEnterNowHistogram'
import FrequencyGraph from './FrequencyGraph'
import VerticalDeltas from './VerticalDeltas'

import SurveyData from '../data/SurveyData'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data_control: {
        school1: null,
        school2: null,
        school3: null,
        school4: null,
      }
    };

    this.survey_data_ref = {};
    this.handleSchoolChange = this.handleSchoolChange.bind(this);
  }

  handleSchoolChange(event) {
  }

  makeGraphs(values) {
    const graphs = [];
    if (values === undefined) {
      graphs.push(<div key="ruh-roh">Uh oh. Couldn't load data. Are you authorized?</div>);
    } else {
      graphs.push(
        <div>Graph here</div>
      );
    }
    return graphs;
  }

  render() {
    let graphs = (<div>Uh oh. Couldn't load data. Are you authorized?</div>);
    if (this.state.survey_data) {
      const values = this.state.survey_data.getValues(this.state.data_control.category, this.state.data_control.demographic, this.state.data_control.source_url);
      graphs = this.makeGraphs(values);
    }
    return (
      <div className="app-flex-root">
        <div className="app-flex-content mdc-toolbar-fixed-adjust">
          <nav className="mdc-drawer mdc-permanent-drawer mdc-typography app-nav">
            <DataControl
              school1="Adams"
              onSchoolChange={this.handleSchoolChange}
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
