import React, { Component } from 'react';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { addActiveApiFetch, removeActiveApiFetch } from 'base/redux/actions/Actions';
import classNames from 'classnames/bind';
import styles from './_single-course-content.scss';
import HeaderAreaLayout from 'base/components/layout/HeaderAreaLayout';
import HeaderContentCourse from 'base/components/header-views/header-content-course/HeaderContentCourse';
import BaseStatCard from 'base/components/stat-cards/BaseStatCard';
import ReportsBox from 'base/components/reports/ReportsBox';
//import LearnerStatistics from 'base/components/learner-statistics/LearnerStatistics';
//import CourseLearnersList from 'base/components/course-learners-list/CourseLearnersList';
import apiConfig from 'base/apiConfig';
//import { timingSafeEqual } from 'crypto';

let cx = classNames.bind(styles);

class SingleCourseContent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      courseData: Immutable.Map(),
      allLearnersLoaded: true,
      learnersList: Immutable.List(),
      apiFetchMoreLearnersUrl: null,
      programName:"",
    };

    this.fetchCourseData = this.fetchCourseData.bind(this);
    this.fetchLearnersData = this.fetchLearnersData.bind(this);
    this.setLearnersData = this.setLearnersData.bind(this);
    this.fetchProgramName = this.fetchProgramName.bind(this);
  }

  fetchCourseData = () => {
    this.props.addActiveApiFetch();
    fetch((apiConfig.coursesDetailed + this.props.courseId + '/'), { credentials: "same-origin" })
      .then(response => response.json())
      .then(json => this.setState({
        courseData: Immutable.fromJS(json)
      }, () => this.props.removeActiveApiFetch()))
      .then(() => this.fetchProgramName())
  }

  fetchProgramName = () => {
    fetch(apiConfig.programName + this.props.courseId + '/', { credentials: "same-origin" })
      .then(response => response.json())
      .then(json => this.setState({
        programName: json.program_name
      }))
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
            programName={this.state.programName}
          />
        </HeaderAreaLayout>
        <ReportsBox courseId={this.state.courseData.getIn(['course_id'])} isProgramCourse={this.state.programName ? true : false}/>
        <div className={cx({ 'container': true, 'base-grid-layout': true, 'dashboard-content': true})}>
          <div className={styles['header']}>
            <div className={styles['header-title']}>Course Activity</div>
          </div>

          <BaseStatCard
            cardTitle='Nb. of learners'
            mainValue={this.state.courseData.getIn(['learners_enrolled', 'current_month'])}
            valueHistory={this.state.courseData.getIn(['learners_enrolled', 'history'], [])}
            tooltipText="Nb. of learners enrolled to the course and learners invited by email."
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
            mainValue={(this.state.courseData.getIn(['learners_enrolled', 'current_month']) - this.state.courseData.get('tma_started'))}
            secondaryValue={this.state.courseData.getIn(['learners_enrolled', 'current_month'])}
            compareToPercent={true}
            compareToPrevious={false}
            enableHistory={false}
            replaceText='of learners'
            tooltipText="Inactive learners."
          />
          <BaseStatCard
            cardTitle='Started'
            mainValue={this.state.courseData.get('tma_started')}
            secondaryValue={this.state.courseData.getIn(['learners_enrolled', 'current_month'])}
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
            tooltipText="Learners who visited every unit in the course.<br/>This does not mean that the learner has been awarded a certificate.<br/>(ex : learner failed at the final quiz)"
          />
          <BaseStatCard
            cardTitle='Partially Completed'
            mainValue={this.state.courseData.get('tma_partially_completed')}
            compareToPrevious={false}
            enableHistory={false}
            tooltipText="Learners who visited at least one unit of the course but not every unit of the course."
          />
          <BaseStatCard
            cardTitle='Participation rate'
            mainValue={
              (this.state.courseData.getIn(['learners_enrolled', 'current_month']) !== 0) ?
              ( (this.state.courseData.get('tma_completed') +  this.state.courseData.get('tma_partially_completed')) / this.state.courseData.getIn(['learners_enrolled', 'current_month']) ) :
              0
            }
            dataType='percentage'
            compareToPrevious={false}
            enableHistory={false}
            tooltipText="Nb. of learners who partially and fully completed / Nb. of learners."
          />
        </div>
        <div className={cx({ 'container': true, 'base-grid-layout': true, 'dashboard-content': true})}>
          <div className={styles['header']}>
            <div className={styles['header-title']}>Learner Achievement
              {this.state.courseData.getIn(['tma_course', 'is_course_graded']) &&         
                <a
                    className={styles['download-btn']}
                    href={'/tma_apps/'+ this.props.courseId +'/progress/average'}
                  >Score details</a>
              }
                </div>
          </div>
          <BaseStatCard
            cardTitle='Passed / Done'
            mainValue={this.state.courseData.get('tma_learners_passed')}
            compareToPrevious={false}
            enableHistory={false}
            tooltipText="Learners who validated the course: <ul><li>By passing the final exam</li><li>In the case of a non graded course, by marking the course as done.</li></ul>"
          />
          <BaseStatCard
            cardTitle='Non certified'
            mainValue={
              this.state.courseData.getIn(['learners_enrolled', 'current_month']) - this.state.courseData.get('tma_learners_passed')
            }
            compareToPrevious={false}
            enableHistory={false}
            tooltipText=" Learners who were not awarded a certificate because : <ul><li>They did not attempt the final exam yet</li><li>They failed the final exam</li><li>In the case of a non graded course: because they did not mark the course as done.</li></ul>"
          />
          {this.state.courseData.getIn(['tma_course', 'is_course_graded']) && 
            <BaseStatCard
              cardTitle='Average success score'
              mainValue={
                (this.state.courseData.get('tma_learners_passed') !== 0) ?
                (this.state.courseData.get('tma_average_success_score')) :
                0
              }
              dataType='percentage'
              compareToPrevious={false}
              enableHistory={false}
              tooltipText="Average score of all learners who were awarded a certificate."
            />
          }
          {this.state.courseData.getIn(['tma_course', 'is_course_graded']) && 
            <BaseStatCard
              cardTitle='Average score'
              mainValue={
                (this.state.courseData.get('tma_learners_passed') !== 0) ?
                (this.state.courseData.get('tma_average_score')) :
                0
              }
              dataType='percentage'
              compareToPrevious={false}
              enableHistory={false}
              tooltipText="Average score of all learners with non-zero grade."
            />
          }
        </div>
        <div className={cx({ 'container': true, 'base-grid-layout': true, 'dashboard-content': true})}>
          {
            /*
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
            />*/
          }
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
