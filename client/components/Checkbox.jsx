import React from 'react';
import {enableUniqueIds} from 'react-html-id';

class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    enableUniqueIds(this);
  }

  render() {
    return (
     <div className="mdc-form-field">
         <div className="mdc-checkbox">
           <input type="checkbox"
                  id={this.nextUniqueId()}
                  name={this.props.name}
                  checked={this.props.checked}
                  onChange={this.props.onChange}
                  className="mdc-checkbox__native-control" />
           <div className="mdc-checkbox__background">
             <svg className="mdc-checkbox__checkmark"
                  viewBox="0 0 24 24">
               <path className="mdc-checkbox__checkmark__path"
                     fill="none"
                     stroke="white"
                     d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
             </svg>
             <div className="mdc-checkbox__mixedmark"></div>
           </div>
         </div>
       <label htmlFor={this.lastUniqueId()}>{this.props.label}</label>
     </div>
    );
  }
}

export default Checkbox;
