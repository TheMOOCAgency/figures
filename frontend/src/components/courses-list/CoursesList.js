import React, { Component } from 'react';
import { List } from 'immutable';
import PropTypes from 'prop-types';
import styles from './_courses-list.scss';
import classNames from 'classnames/bind';
import CoursesListItem from './CoursesListItem';

let cx = classNames.bind(styles);

class CoursesList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sortListBy: '',
      coursesList: List()
    };

    this.changeSorting = this.changeSorting.bind(this);
  }

  changeSorting = (parameter) => {
    let coursesList = this.state.coursesList;
    /* TMA specifing sorting filters */
    if (parameter === 'tag') {
      coursesList = coursesList.sortBy(item => item.getIn(['tma_course', 'tag']));
    } else if (parameter === 'mandatory') {
      coursesList = coursesList.filter(item => item.getIn(['tma_course', 'is_mandatory']) === true);
    } else if (parameter === 'language') {
      coursesList = coursesList.sortBy(item => item.get('language'))
    } else if (parameter === 'all') {
      coursesList = this.props.coursesList;
    }
    this.setState({
      coursesList: coursesList,
      sortListBy: parameter,
    })
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps !== this.props) {
      this.setState({
        coursesList: List(nextProps.coursesList)
      })
    }
  }

  render() {
    const courseItems = this.state.coursesList.map((item, index) => {
      return (
        <CoursesListItem
          courseName={item.get('course_name')}
          courseId={item.get('course_id')}
          courseIsSelfPaced={item.get('self_paced')}
          startDate={item.get('start_date')}
          endDate={item.get('end_date')}
          learnersInvited={item.get('tma_learners_invited')}
          learnersStarted={
            (item.get('tma_learners_enrolled') !== 0) ?
            (item.getIn(['tma_course', 'active_enrollments_total']) / item.get('tma_learners_enrolled')).toFixed(2) : 0
          }
          learnersCompleted={
            (item.get('tma_learners_enrolled') !== 0) ?
            (item.get('tma_completed') / item.get('tma_learners_enrolled')).toFixed(2) : 0
          }
          learnersNotStarted={(item.get('tma_learners_enrolled') - item.getIn(['tma_course', 'active_enrollments_total']))}
          tag={item.getIn(['tma_course', 'tag'])}
          language={item.get('language')}
          key={index}
        />
      )
    })

    return (
      <section className={styles['courses-list']}>
        <div className={styles['header']}>
          <div className={styles['header-title']}>
            {this.props.listTitle}
          </div>
          <div className={styles['sort-container']}>
            <span>Sort by:</span>
            <ul>
              <li onClick={this.changeSorting.bind(this, 'all')} className={cx({ 'sort-item': true, 'active': (this.state.sortListBy === 'all')})}>All</li>
              <li onClick={this.changeSorting.bind(this, 'tag')} className={cx({ 'sort-item': true, 'active': (this.state.sortListBy === 'tag')})}>Tag</li>
              <li onClick={this.changeSorting.bind(this, 'language')} className={cx({ 'sort-item': true, 'active': (this.state.sortListBy === 'language')})}>Language</li>
              <li onClick={this.changeSorting.bind(this, 'mandatory')} className={cx({ 'sort-item': true, 'active': (this.state.sortListBy === 'mandatory')})}>Mandatory</li>
            </ul>
          </div>
        </div>
        <div className={styles['items-container']}>
          {courseItems}
        </div>
      </section>
    )
  }
}

CoursesList.defaultProps = {
  listTitle: 'Course data:',
  CoursesList: []
}

CoursesList.propTypes = {
  listTitle: PropTypes.string,
  coursesList: PropTypes.array
};

export default CoursesList;
