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

      const dichotomy = this.state.data_control.dichotomy;
      if (dichotomy === "") {
        graphs = this.makeGraphs(values);
      } else {
        const group1 = [];
        const group2 = [];
        for (const d of values) {
          if (dichotomy === "1-minute-survey") {
            d.survey_time === 1 ? group1.push(d) : group2.push(d);
          } else if (dichotomy === "3-minute-survey") {
            d.survey_time === 3 ? group1.push(d) : group2.push(d);
          } else if (dichotomy === "high-enter") {
            d.enter >= 4 ? group1.push(d) : group2.push(d);
          }
        }
        graphs = (
          <div className="nmn-test-dichotomy-root">
            <div className="nmn-test-dichotomy-content">
              <div className="column">
                <div className="card mdc-card mdc-theme--secondary-bg mdc-card--theme-dark">
                  <section className="mdc-card__primary nmn-test-dichotomy-group1-header">
                    <h2 className="mdc-card__title mdc-card__title--large">{dichotomy}</h2>
                  </section>
                </div>
                <div className="nmn-test-dichotomy-group1">
                  {this.makeGraphs(group1)}
                </div>
              </div>

              <div className="column">
                <div className="card mdc-card mdc-theme--secondary-bg mdc-card--theme-dark">
                  <section className="mdc-card__primary nmn-test-dichotomy-group2-header">
                    <h2 className="mdc-card__title mdc-card__title--large">Not {dichotomy}</h2>
                  </section>
                </div>
                <div className="nmn-test-dichotomy-group2">
                  {this.makeGraphs(group2)}
                </div>
              </div>
            </div>
          </div>
        );
      }
    }
    return (
      <div className="nmn-test-flex-root">
        <div className="nmn-test-flex-content mdc-toolbar-fixed-adjust ">
          <nav className="mdc-drawer mdc-permanent-drawer mdc-typography nmn-test-nav">
            <DataControl
              school1="Adams"
              onSchool1Change={this.handleSchoolChange}
              />
          </nav>
          <main className="nmn-test-main">
            {graphs}
          </main>
        </div>
      </div>
    );
  }
}

export default App;
