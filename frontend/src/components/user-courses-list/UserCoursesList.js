import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './_user-courses-list.scss';
import classNames from 'classnames/bind';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/fontawesome-free-solid';

let cx = classNames.bind(styles);

class UserCoursesList extends Component {

  render() {
    const coursesRender = this.props.enrolledCoursesData.map((course, index) => {
      const progressBarWidth = (course.getIn(['progress_data', 'course_progress_details', 'completion_rate'], 0)*100).toFixed(0) + '%';
      console.log(course)
      return (
        <div key={index} className={cx({'stat-card': true, 'course-item': true})}>
          <div className={styles['course-info']}>
            <span className={styles['course-code']}>{course['course_code']}</span>
            <Link className={styles['course-name']} to={"/figures/course/" + course.getIn(['course_id'], "")}>{course.getIn(['course_name'], "")}</Link>
          </div>
          <ul className={styles['user-stats']}>
            <li className={styles['stat']}>
              <span className={styles['stat-label']}>
                Date enrolled:
              </span>
              <span className={styles['stat-value']}>
                {course.getIn(['date_enrolled'])}
              </span>
            </li>
            <li className={styles['stat']}>
              <span className={styles['stat-label']}>
                Course completed:
              </span>
              <span className={styles['stat-value']}>
                {course.getIn(['progress_data', 'course_completed']) ? <FontAwesomeIcon icon={faCheck} className={styles['completed-icon']} /> : '-'}
              </span>
            </li>
            <li className={styles['stat']}>
              <span className={styles['stat-label']}>
                Score:
              </span>
              <span className={styles['stat-value']}>
                {(course.getIn(['progress_data', 'course_progress_details', 'best_student_grade'], 0)*100).toFixed(2)}%
              </span>
            </li>
            <li className={styles['stat']}>
              <span className={styles['stat-label']}>
                Overall progress:
              </span>
              <span className={styles['stat-value']}>
                {(course.getIn(['progress_data', 'course_progress_details', 'completion_rate'], 0)*100).toFixed(2)}%
              </span>
            </li>
          </ul>
          <div className={styles['button-section']}>
            <a href={'/courses/' + course.get('course_id') + '/progress/'+ this.props.userId} className={styles['course-button']}>Detailed results</a>
          </div>
          <div className={styles['progress-bar']}>
            <span className={cx({'bar': true, 'finished': course.getIn(['progress_data', 'course_progress_details', 'completion_rate'])})} style={{width: progressBarWidth}}></span>
          </div>
        </div>
      )
    })

    return (
      <section className={styles['user-courses-list']}>
        {coursesRender}
      </section>
    )
  }
}

export default UserCoursesList;
