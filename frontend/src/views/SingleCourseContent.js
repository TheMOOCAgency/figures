import React, { Component } from 'react';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { addActiveApiFetch, removeActiveApiFetch } from 'base/redux/actions/Actions';
import classNames from 'classnames/bind';
import styles from './_single-course-content.scss';
import HeaderAreaLayout from 'base/components/layout/HeaderAreaLayout';
import HeaderContentCourse from 'base/components/header-views/header-content-course/HeaderContentCourse';
import BaseStatCard from 'base/components/stat-cards/BaseStatCard';
//import LearnerStatistics from 'base/components/learner-statistics/LearnerStatistics';
//import CourseLearnersList from 'base/components/course-learners-list/CourseLearnersList';
import apiConfig from 'base/apiConfig';
//import { timingSafeEqual } from 'crypto';

// IMPORT TMA
//import LearnerStats from 'base/components/course-learners-list/LearnerStats.js'

let cx = classNames.bind(styles);

class SingleCourseContent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      courseData: Immutable.Map(),
      allLearnersLoaded: true,
      learnersList: Immutable.List(),
      apiFetchMoreLearnersUrl: null,
      // TMA States //
      gradeReports: [],
      downloadStatus: '',
      lastReport: {}
    };

    this.fetchCourseData = this.fetchCourseData.bind(this);
    this.fetchLearnersData = this.fetchLearnersData.bind(this);
    this.setLearnersData = this.setLearnersData.bind(this);
    this.generateGradeReport = this.generateGradeReport.bind(this);
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
    this.fetchLearnersData();
  }

  /*** TMA FUNCTIONS ***/
  getFetchOptions = () => {
    // Options for API calls
    return { credentials: "same-origin", method: "POST", headers: {
        'X-CSRFToken': window.csrf
      }
    };
  }

  getReportsList = () => {
    fetch('/courses/'+this.props.courseId+'/instructor/api/list_report_downloads', this.getFetchOptions())
    .then(response => response.json())
    .then((json) => {
      this.setState({
        gradeReports: json.downloads
      });
    });
  }

  updateReportsList = (reports) => {
    this.setState({
      gradeReports: reports,
      lastReport: reports[0],
      downloadStatus: "To download the report, please click the link :"
    });
  }

  checkReportList = () => {
    const courseId = this.props.courseId;
    const options = this.getFetchOptions();
    const reports = this.state.gradeReports;
    const update = this.updateReportsList;
    // Check when report list has new report - means that task is done
    let intervalID = setInterval(function(){
      fetch('/courses/'+ courseId +'/instructor/api/list_report_downloads', options)
      .then(response => response.json())
      .then((json) => {
        // If new report in list, set state and clear interval
        if (json.downloads.length > reports.length) {
          update(json.downloads);
          clearInterval(intervalID);
        }
      })
    }, 500)
  }

  generateGradeReport = () => {
    // Launch report task
    fetch('/courses/'+ this.props.courseId +'/instructor/api/problem_grade_report', this.getFetchOptions())
    .then(response => response.json())
    .then(() => {
      // Set status and get initial report list
      this.setState({downloadStatus: "Your report is being generated, please wait."});
      this.getReportsList();
      this.checkReportList();
    }); 
  }
  /*** END ***/

  render() {
    return (
      <div className="ef--layout-root">
        <HeaderAreaLayout>
          <HeaderContentCourse
            microsite={this.state.courseData.getIn(['org'])}
            startDate={this.state.courseData.getIn(['start_date'])}
            endDate={this.state.courseData.getIn(['end_date'])}
            courseCode={this.state.courseData.getIn(['course_code'])}
            courseName={this.state.courseData.getIn(['course_name'])}
            courseId={this.state.courseData.getIn(['course_id'])}
            likesTotal={this.state.courseData.getIn(['tma_course', 'liked_total'])}
            isMandatory={this.state.courseData.getIn(['tma_course', 'is_mandatory'])}
            tag={this.state.courseData.getIn(['tma_course', 'tag'])}
            language={this.state.courseData.getIn(['language'])}
            isManagerOnly={this.state.courseData.getIn(['tma_course', 'is_manager_only'])}
            isSelfPaced={this.state.courseData.getIn(['self_paced'])}
            requiredGrade={this.state.courseData.getIn(['passing_grade'])}
            learnersEnrolled={this.state.courseData.getIn(['learners_enrolled'])}
          />
        </HeaderAreaLayout>
        <div className={cx({ 'container': true, 'base-grid-layout': true, 'dashboard-content': true})}>
          <div className={styles['report-box']}>
            <span className={styles['download-btn']} onClick={this.generateGradeReport}>Download report</span>
          </div>
          <div className={styles['report-box']}>
            <span className={styles['report-link']}>{this.state.downloadStatus}</span>
          </div>
          <div className={styles['report-box']}>
            {this.state.lastReport && <a className={styles['report-link']} href={this.state.lastReport.url}>{this.state.lastReport.name}</a>}
          </div>
        </div>
        <div className={cx({ 'container': true, 'base-grid-layout': true, 'dashboard-content': true})}>
          <div className={styles['header']}>
            <div className={styles['header-title']}>Course Activity</div>
          </div>

          <BaseStatCard
            cardTitle='Nb. of learners'
            mainValue={this.state.courseData.getIn(['learners_enrolled', 'current_month'])}
            valueHistory={this.state.courseData.getIn(['learners_enrolled', 'history'], [])}
          />
          <BaseStatCard
            cardTitle='Invited'
            mainValue={this.state.courseData.get('tma_learners_invited')}
            compareToPrevious={false}
            enableHistory={false}
            replaceText='of learners'
            tooltipText="Nb. of learners invited by email"
          />
          <BaseStatCard
            cardTitle='Not started'
            mainValue={(this.state.courseData.get('tma_learners_enrolled') - this.state.courseData.getIn(['tma_course', 'active_enrollments_total']))}
            secondaryValue={this.state.courseData.get('tma_learners_enrolled')}
            compareToPercent={true}
            compareToPrevious={false}
            enableHistory={false}
            replaceText='of learners'
            tooltipText="Registered but inactive learners."
          />
          <BaseStatCard
            cardTitle='Started'
            mainValue={this.state.courseData.getIn(['tma_course', 'active_enrollments_total'])}
            secondaryValue={this.state.courseData.get('tma_learners_enrolled')}
            compareToPercent={true}
            compareToPrevious={false}
            enableHistory={false}
            replaceText='of learners'
            tooltipText="Registered and active learners."
          />
        </div>
        <div className={cx({ 'container': true, 'base-grid-layout': true, 'dashboard-content': true})}>
          <div className={styles['header']}>
            <div className={styles['header-title']}>Learner Engagement</div>
          </div>
          <BaseStatCard
            cardTitle='Fully Completed'
            mainValue={this.state.courseData.get('tma_completed')}
            compareToPrevious={false}
            enableHistory={false}
            tooltipText="Learners who visited every unit of the course."
          />
          <BaseStatCard
            cardTitle='Partially Completed'
            mainValue={this.state.courseData.get('tma_partially_completed') + this.state.courseData.get('tma_completed')}
            compareToPrevious={false}
            enableHistory={false}
            tooltipText="Learners who visited at least one unit of the course."
          />
          <BaseStatCard
            cardTitle='Participation rate'
            mainValue={this.state.courseData.get('tma_partially_completed')}
            secondaryValue={this.state.courseData.get('tma_learners_enrolled')}
            dataType='percentage'
            compareToPrevious={false}
            enableHistory={false}
            tooltipText="Nb. of learners who partially completed / Nb. of learners."
          />
        </div>
        <div className={cx({ 'container': true, 'base-grid-layout': true, 'dashboard-content': true})}>
          <div className={styles['header']}>
            <div className={styles['header-title']}>Completion</div>
          </div>
          <BaseStatCard
            cardTitle='Certificates awarded'
            mainValue={this.state.courseData.get('tma_learners_passed')}
            compareToPrevious={false}
            enableHistory={false}
            tooltipText="Learners who validated the course."
          />
          <BaseStatCard
            cardTitle='Non certified'
            mainValue={this.state.courseData.getIn(['tma_course', 'active_enrollments_total']) - this.state.courseData.get('tma_learners_passed')}
            compareToPrevious={false}
            enableHistory={false}
            tooltipText="Learners who did not validate the course."
          />
          <BaseStatCard
            cardTitle='Average score'
            mainValue={this.state.courseData.getIn(['tma_course', 'tma_average_score'])}
            dataType='percentage'
            compareToPrevious={false}
            enableHistory={false}
            tooltipText="Average score of all learners for this course."
          />
        </div>
        <div className={cx({ 'container': true, 'base-grid-layout': true, 'dashboard-content': true})}>
          {/*
            <LearnerStats
              url={this.state.lastReport.url}
            />
            <LearnerStatistics
              learnersData = {this.state.learnersList}
            />
            <CourseLearnersList
              courseId = {this.props.courseId}
              allLearnersLoaded = {this.state.allLearnersLoaded}
              apiFetchMoreLearnersFunction = {this.fetchLearnersData}
              learnersData = {this.state.learnersList}
            />*/}
        </div>
        <div className={cx({ 'container': true, 'base-grid-layout': true, 'dashboard-content': true})}>
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
