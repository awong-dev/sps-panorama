import React from 'react'
import firebase from 'firebase'

class LoginBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { logged_in: false };
    this.handleLoginButton = this.handleLoginButton.bind(this);
  }

  componentDidMount() {
    // Sync the login state.
    this.unsubscribeAuth = firebase.auth().onAuthStateChanged((user) => {
      this.setState({user});
    });
  }

  componentWillUnmount() {
    this.unsubscribeAuth();
  }

  handleLoginButton() {
    if (this.state.user) {
      // Logout.
      firebase.auth().signOut().then(() => {
        this.setState({user: null});
      }).catch((error) => {
        // An error happened.
        console.error("Unable to log out");
      });
    } else {
      // Login.
	 const provider = new firebase.auth.GoogleAuthProvider();
	 provider.setCustomParameters({prompt: 'select_account'});
	 firebase.auth().signInWithPopup(provider).then((result) => {
        this.setState({token: result.credential.accessToken});
	 }).catch(function(error) {
	   // Handle Errors here.
	   const errorCode = error.code;
	   const errorMessage = error.message;
	   // The email of the user's account used.
	   const email = error.email;
	   // The firebase.auth.AuthCredential type that was used.
	   const credential = error.credential;
        console.log(errorCode, errorMessage, email, credential);
	 });
    }
  }

  render() {
    const status = this.state.user ? `${this.state.user.displayName} <${this.state.user.email}>` : 'Anonymous';
    return (
      <header className="login-bar mdc-toolbar mdc-toolbar--fixed">
        <div className="mdc-toolbar__row">
          <section className="mdc-toolbar__section mdc-toolbar__section--align-start">
            <span className="mdc-toolbar__title">NMN data fun</span>
          </section>
          <section className="mdc-toolbar__section mdc-toolbar__section--align-end">
            <button className="login-button mdc-toolbar__icon"
                   onClick={this.handleLoginButton}>{this.state.user ? `Logout [${status}]` : 'Login'}</button>
          </section>
        </div>
      </header>
    );
  }
}

export default LoginBar;
