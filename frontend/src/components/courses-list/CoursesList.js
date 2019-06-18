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
      sortListValue: '',
      coursesList: List()
    };

    this.changeSorting = this.changeSorting.bind(this);
  }

  /* TMA tags list and custom sorting*/
  getTags() {
    let all = this.state.coursesList.map((item) => item.getIn(['tma_course', 'tag']));
    all = all.toArray().toString().split(',');
    return all.filter((item, i, self) => self.indexOf(item) === i)
  }

  getLanguages() {
    let languages = this.state.coursesList.map((item) => item.get('language'));
    return languages.filter((item, i, self) => self.indexOf(item) === i);
  }

  /* TMA specific sorting filters */
  changeSorting = (parameter, event) => {
    let coursesList = this.state.coursesList;
    if (parameter === 'tag') {
      coursesList = this.props.coursesList.filter(item => item.getIn(['tma_course', 'tag']) === event.target.value);
    } else if (parameter === 'mandatory') {
      coursesList = this.props.coursesList.filter(item => item.getIn(['tma_course', 'is_mandatory']) === Boolean(event.target.value));
    } else if (parameter === 'language') {
      coursesList = this.props.coursesList.sortBy(item => item.get('language') === event.target.value)
    } else if (parameter === 'all') {
      coursesList = this.props.coursesList;
    }
    this.setState({
      coursesList: coursesList,
      sortListBy: parameter,
      sortListValue: event.target.value
    });
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps !== this.props) {
      this.setState({
        coursesList: List(nextProps.coursesList)
      })
    }
  }

  render() {
    const tags = this.getTags().map((tag) => {
      return (
        <option value={tag}>{tag}</option>
      )
    });
    const languages = this.getLanguages().map((lang) => {
      return (
        <option value={lang}>{lang}</option>
      )
    });
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
              <li className={cx({ 'sort-item': true, 'active': (this.state.sortListBy === 'tag')})}>
                <select onChange={this.changeSorting.bind(this, 'tag')}>
                  <option value="">- Tag -</option>
                  {tags}
                </select>
               </li>
              <li onClick={this.changeSorting.bind(this, 'language')} className={cx({ 'sort-item': true, 'active': (this.state.sortListBy === 'language')})}>
                <select>
                  <option value="">- Language -</option>
                  {languages}
                </select>
              </li>
              <li onClick={this.changeSorting.bind(this, 'mandatory')} className={cx({ 'sort-item': true, 'active': (this.state.sortListBy === 'mandatory')})}>
                <select>
                  <option value="">- Mandatory -</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </li>
            </ul>
          </div>
        </div>
        <div className={styles['items-container']}>
          {courseItems.size === 0 ? <span className={styles['no-results']}>No results were found matching your request.</span> : courseItems}
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
