import React from 'react';
import Measure from 'react-measure'

const ChartCard = ({children, title, subtitle, id, onResize}) => (
  <div id={id} className="card mdc-card mdc-theme--primary-bg mdc-card--theme-dark">
    <section className="mdc-card__primary">
      <h1 className="mdc-card__title mdc-card__title--large">{title}</h1>
      <h2 className="mdc-card__subtitle">{subtitle}</h2>
    </section>
    <section className="mdc-card__supporting-text">
      <div className="chart">
        <Measure bounds onResize={onResize}>
          {({ measureRef }) =>
            <div ref={measureRef}>
              {children}
            </div>
          }
        </Measure>
      </div>
    </section>
  </div>
);

export default ChartCard;
