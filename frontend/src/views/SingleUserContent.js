import React, { Component } from 'react';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { addActiveApiFetch, removeActiveApiFetch } from 'base/redux/actions/Actions';
import classNames from 'classnames/bind';
import styles from './_single-user-content.scss';
import HeaderAreaLayout from 'base/components/layout/HeaderAreaLayout';
import HeaderContentUser from 'base/components/header-views/header-content-user/HeaderContentUser';
import UserCoursesList from 'base/components/user-courses-list/UserCoursesList';
import apiConfig from 'base/apiConfig';

var countries = require("i18n-iso-countries");
countries.registerLocale(require("i18n-iso-countries/langs/en.json"));

/*
const educationLevelsDict = {
  "p": "PhD or Doctorate",
  "m": "Master's or professional degree",
  "b": "Bachelor's degree",
  "a": "Associate's degree",
  "hs": "Secondary/high school",
  "jhs": "Junior secondary/junior high/middle school",
  "none": "None",
  "o": "Other",
  "n-a": "Not available"
}

const genderDict = {
  "m": "Male",
  "f": "Female",
  "o": "Other / Prefer not to say"
}
*/

let cx = classNames.bind(styles);

class SingleUserContent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userData: Immutable.Map()
    };

    this.fetchUserData = this.fetchUserData.bind(this);
  }

  fetchUserData = () => {
    this.props.addActiveApiFetch();
    fetch((apiConfig.learnersDetailed + this.props.userId + '/'), { credentials: "same-origin" })
      .then(response => response.json())
      .then(json => this.setState({
        userData: Immutable.fromJS(json)
      }, () => this.props.removeActiveApiFetch()))
  }

  componentDidMount() {
    this.fetchUserData();
  }

  render() {
    const dateJoined = new Date(this.state.userData.getIn(['date_joined']));
    
    return (
      <div className="ef--layout-root">
        <HeaderAreaLayout>
          <HeaderContentUser
            email={this.state.userData.getIn(['email'])}
            name={this.state.userData.getIn(['name'])}
            rpid={this.state.userData.getIn(['rpid'])}
            iug={this.state.userData.getIn(['iug'])}
            joined={dateJoined.getDate() +'-'+ dateJoined.getMonth() +'-'+ dateJoined.getFullYear()}
          />
        </HeaderAreaLayout>
        <div className={cx({ 'container': true, 'base-grid-layout-5': true, 'user-content': true})}>
          {/*
          <div className={styles['user-information']}>
            <div className={styles['name']}>
              {this.state.userData['name']}
            </div>
            <ul className={styles['user-details']}>
              <li>
                <span className={styles['label']}>Username:</span>
                <span className={styles['value']}>{this.state.userData.getIn(['username'])}</span>
              </li>
              <li>
                <span className={styles['label']}>Date joined:</span>
                <span className={styles['value']}>{dateJoined.toDateString()}</span>
              </li>
              <li>
                <span className={styles['label']}>Is active:</span>
                <span className={styles['value']}>{this.state.userData.getIn(['is_active'], false) ? 'Active user' : 'User inactive'}</span>
              </li>
              <li>
                <span className={styles['label']}>Courses enrolled:</span>
                <span className={styles['value']}>{this.state.userData.getIn(['courses']) ? this.state.userData.getIn(['courses']).length : ""}</span>
              </li>
              <li>
                <span className={styles['label']}>Country:</span>
                <span className={styles['value']}>{this.state.userData.getIn(['country']) ? countries.getName(this.state.userData.getIn(['country']), "en") : "Not Available"}</span>
              </li>
              <li>
                <span className={styles['label']}>Level of education:</span>
                <span className={styles['value']}>{this.state.userData.getIn(['level_of_education']) ? educationLevelsDict[this.state.userData.getIn(['level_of_education'])] : 'Not Available'}</span>
              </li>
              <li>
                <span className={styles['label']}>Email address:</span>
                <span className={styles['value']}><a href={"mailto:" + this.state.userData.getIn(['email'])}>{this.state.userData.getIn(['email'])}</a></span>
              </li>
            </ul>
          </div>
          */}
          <UserCoursesList
            enrolledCoursesData={this.state.userData.getIn(['courses'], [])}
            userId={this.state.userData.getIn(['id'])}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({

})

const mapDispatchToProps = dispatch => ({
  addActiveApiFetch: () => dispatch(addActiveApiFetch()),
  removeActiveApiFetch: () => dispatch(removeActiveApiFetch()),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SingleUserContent)
