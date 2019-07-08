import React, { Component } from 'react';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import styles from './_dashboard-content.scss';
import HeaderAreaLayout from 'base/components/layout/HeaderAreaLayout';
import HeaderContentMaus from 'base/components/header-views/header-content-maus/HeaderContentMaus';
import BaseStatCard from 'base/components/stat-cards/BaseStatCard';
import CoursesList from 'base/components/courses-list/CoursesList';
import apiConfig from 'base/apiConfig';
// TMA imports
import TopCoursesStatCard from '../components/stat-cards/TopCoursesCard';

let cx = classNames.bind(styles);


class DashboardContent extends Component {

  constructor(props) {
    super(props);
    this.state = {
      coursesDetailed: Immutable.List(),
    };
    this.fetchCoursesList = this.fetchCoursesList.bind(this);
  }

  fetchCoursesList = () => {
    fetch(apiConfig.coursesDetailed, { credentials: "same-origin" })
      .then(response => response.json())
      .then(json => this.setState({
        coursesDetailed: Immutable.fromJS(json)
        //coursesDetailed: Immutable.fromJS(json)
      }))
  }

  componentDidMount() {
    this.fetchCoursesList();
  }

  render() {
    return (
      <div className="ef--layout-root">
        <HeaderAreaLayout>
          <HeaderContentMaus
            showHistoryButton
          />
        </HeaderAreaLayout>
        <div className={cx({ 'container': true, 'base-grid-layout': true, 'dashboard-content': true})}>
          <BaseStatCard
            cardTitle='Registered learners'
            mainValue={this.props.generalData.getIn(['total_site_users', 'current_month'])}
            valueHistory={this.props.generalData.getIn(['total_site_users', 'history'])}
          />
          <BaseStatCard
            cardTitle='Course enrollments'
            mainValue={this.props.generalData.getIn(['total_course_enrollments', 'current_month'])}
            valueHistory={this.props.generalData.getIn(['total_course_enrollments', 'history'])}
          />
          <TopCoursesStatCard
            cardTitle='Top courses'
            coursesList={this.state.coursesDetailed}
            enableTooltip={true}
            tooltipText='Courses ordered by number of enrollments.'
          />
          <CoursesList
            coursesList={this.state.coursesDetailed}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  generalData: Immutable.fromJS(state.generalData.data)
})

export default connect(
  mapStateToProps,
)(DashboardContent)
