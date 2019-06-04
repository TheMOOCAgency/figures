import React, { Component } from 'react';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { addActiveApiFetch, removeActiveApiFetch } from 'base/redux/actions/Actions';
import classNames from 'classnames/bind';
import styles from './_single-course-content.scss';
import HeaderAreaLayout from 'base/components/layout/HeaderAreaLayout';
import HeaderContentCourse from 'base/components/header-views/header-content-course/HeaderContentCourse';
import BaseStatCard from 'base/components/stat-cards/BaseStatCard';
import ImageCard from 'base/components/stat-cards/ImageCard';
//import LearnerStatistics from 'base/components/learner-statistics/LearnerStatistics';
//import CourseLearnersList from 'base/components/course-learners-list/CourseLearnersList';
import apiConfig from 'base/apiConfig';

let cx = classNames.bind(styles);

class SingleCourseContent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      courseData: Immutable.Map(),
      allLearnersLoaded: true,
      learnersList: Immutable.List(),
      apiFetchMoreLearnersUrl: null,
    };

    this.fetchCourseData = this.fetchCourseData.bind(this);
    this.fetchLearnersData = this.fetchLearnersData.bind(this);
    this.setLearnersData = this.setLearnersData.bind(this);
  }

  fetchCourseData = () => {
    this.props.addActiveApiFetch();
    fetch((apiConfig.coursesDetailed + this.props.courseId + '/'), { credentials: "same-origin" })
      .then(response => response.json())
      .then(json => this.setState({
        courseData: Immutable.fromJS(json)
      }, () => this.props.removeActiveApiFetch()))
  }

  fetchLearnersData = () => {
    this.props.addActiveApiFetch();
    fetch((this.state.apiFetchMoreLearnersUrl === null) ? (apiConfig.learnersDetailed + '?enrolled_in_course_id=' + this.props.courseId) : this.state.apiFetchMoreLearnersUrl, { credentials: "same-origin" })
      .then(response => response.json())
      .then(json => this.setLearnersData(json['results'], json['next']))
  }

  setLearnersData = (results, paginationNext) => {
    const tempLearners = this.state.learnersList.concat(Immutable.fromJS(results));
    this.setState ({
      allLearnersLoaded: paginationNext === null,
      learnersList: tempLearners,
      apiFetchMoreLearnersUrl: paginationNext
    }, () => this.props.removeActiveApiFetch())
  }

  componentDidMount() {
    this.fetchCourseData();
    //this.fetchLearnersData();
  }

  /*** TMA FUNCTIONS ***/
  populateMetrics = () => {
    fetch(apiConfig.updateData, { credentials: "same-origin" })
    .then(response => console.log(response))
    .then(data => console.log(data))
  }

  render() {
    return (
      <div className="ef--layout-root">
        <HeaderAreaLayout>
          <HeaderContentCourse
            microsite = {this.state.courseData.getIn(['org'])}
            startDate = {this.state.courseData.getIn(['start_date'])}
            endDate = {this.state.courseData.getIn(['end_date'])}
            courseName = {this.state.courseData.getIn(['course_name'])}
            courseId = {this.state.courseData.getIn(['course_id'])}
            likesTotal = {this.state.courseData.getIn(['tma_course', 'liked_total'])}
            isMandatory = {this.state.courseData.getIn(['tma_course', 'is_mandatory'])}
            tag = {this.state.courseData.getIn(['tma_course', 'tag'])}
            language={this.state.courseData.getIn(['language'])}
            isManagerOnly = {this.state.courseData.getIn(['tma_course', 'is_manager_only'])}
            isSelfPaced = {this.state.courseData.getIn(['self_paced'])}
            requiredGrade = {this.state.courseData.getIn(['passing_grade'])}
            learnersEnrolled = {this.state.courseData.getIn(['learners_enrolled'])}
            updateData = {this.populateMetrics}
          />
        </HeaderAreaLayout>
        <div className={cx({ 'container': true, 'base-grid-layout': true, 'dashboard-content': true})}>
          <div className={styles['header']}>
            <div className={styles['header-title']}>Course Activity</div>
          </div>

          <BaseStatCard
            cardTitle='No. of learners'
            mainValue={this.state.courseData.getIn(['learners_enrolled', 'current_month'], 0)}
            valueHistory={this.state.courseData.getIn(['learners_enrolled', 'history'], [])}
          />
          <BaseStatCard
            cardTitle='Invited'
            mainValue={0}
            //secondaryValue={0}
            //compareToPercent={true}
            compareToPrevious={false}
            enableHistory={false}
            replaceText='of learners'
          />
          <BaseStatCard
            cardTitle='Not started'
            mainValue={(this.state.courseData.get('tma_learners_enrolled') - this.state.courseData.get('tma_active_learners'))}
            secondaryValue={this.state.courseData.get('tma_learners_enrolled')}
            compareToPercent={true}
            compareToPrevious={false}
            enableHistory={false}
            replaceText='of learners'
          />
          <BaseStatCard
            cardTitle='Started'
            mainValue={this.state.courseData.get('tma_active_learners')}
            secondaryValue={this.state.courseData.get('tma_learners_enrolled')}
            compareToPercent={true}
            compareToPrevious={false}
            enableHistory={false}
            replaceText='of learners'
          />
          <div className={styles['header']}>
            <div className={styles['header-title']}>Learner Engagement</div>
          </div>
          <BaseStatCard
            cardTitle='Fully Completed'
            mainValue={this.state.courseData.getIn(['users_completed', 'current_month'], 0)}
            compareToPrevious={false}
            enableHistory={false}
          />
          <BaseStatCard
            cardTitle='Partially Completed'
            mainValue={this.state.courseData.getIn(['users_completed', 'current_month'], 0)}
            compareToPrevious={false}
            enableHistory={false}
          />
          <BaseStatCard
            cardTitle='Participation rate'
            mainValue={this.state.courseData.getIn(['users_completed', 'current_month'], 0)}
            dataType='percentage'
            compareToPrevious={false}
            enableHistory={false}
          />
          <ImageCard
            cardImage={'/static/tma-static/images/logo-phileas.jpg'}
          />
          <div className={styles['header']}>
            <div className={styles['header-title']}>Completion</div>
          </div>
          <BaseStatCard
            cardTitle='Certificates awarded'
            mainValue={this.state.courseData.get('tma_learners_passed')}
            compareToPrevious={false}
            enableHistory={false}
          />
          <BaseStatCard
            cardTitle='Non certified'
            mainValue={this.state.courseData.get('tma_active_learners') - this.state.courseData.get('tma_learners_passed')}
            compareToPrevious={false}
            enableHistory={false}
          />
          <BaseStatCard
            cardTitle='Average score'
            mainValue={this.state.courseData.getIn(['users_completed', 'current_month'], 0)}
            dataType='percentage'
            compareToPrevious={false}
            enableHistory={false}
          />
          <ImageCard
            cardImage={'/static/tma-static/images/logo-phileas.jpg'}
          />
          {/*
            <LearnerStatistics
              learnersData = {this.state.learnersList}
            />
            <CourseLearnersList
              courseId = {this.props.courseId}
              allLearnersLoaded = {this.state.allLearnersLoaded}
              apiFetchMoreLearnersFunction = {this.fetchLearnersData}
              learnersData = {this.state.learnersList}
            />
          */}
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
)(SingleCourseContent)
