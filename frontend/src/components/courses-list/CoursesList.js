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
      tagsList: [],
      languagesList: [],
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
    all = all.map(tag => tag.trim());
    this.setState({
      tagsList: all.filter((item, i, self) => self.indexOf(item) === i)
    });
  }

  getLanguages() {
    let languages = this.state.coursesList.map((item) => item.get('language'));
    let languagesList = languages.filter((item, i, self) => self.indexOf(item) === i);
    this.setState({
      languagesList: languagesList
    });
  }

  parseLanguage = (language) => {
    if (language) {
      if (language === 'fr') {
        return 'French';
      } else if (language === 'en') {
        return 'English'
      }
    }
  }

  changeSorting = (parameter, event) => {
    let coursesList = this.state.coursesList;
    switch (parameter) {
      case 'tag':
        if (event.target.value === '') {
          coursesList = this.props.coursesList;
        } else {
          coursesList = this.props.coursesList.filter(item => item.getIn(['tma_course', 'tag']) === event.target.value);
        }
        break;
      case 'mandatory':
        if (event.target.value === '') {
          coursesList = this.props.coursesList;
        } else {
          coursesList = this.props.coursesList.filter(item => item.getIn(['tma_course', 'is_mandatory']) === (('true' === event.target.value)));
        }
        break;
      case 'language':
        if (event.target.value === '') {
          coursesList = this.props.coursesList;
        } else {
          coursesList = this.props.coursesList.filter(item => item.get('language') === event.target.value)
        }
        break;
      case 'all':
        coursesList = this.props.coursesList;
        break;
      default:
        coursesList = this.props.coursesList;
    };
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
      }, () => {
        this.getTags();
        this.getLanguages();
      });
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
          nbLeaners={item.getIn(['learners_enrolled', 'current_month'])}
          learnersCompleted={item.get('tma_completed')}
          certificatesAwarded={item.get('tma_learners_passed')}
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
                <select value={this.state.sortListBy !== 'tag' ? '' : this.state.sortListValue} onChange={this.changeSorting.bind(this, 'tag')}>
                  <option value="">- Tag -</option>
                  {this.state.tagsList.map((tag, i) => 
                    <option value={tag} key={i}>{tag}</option>
                  )}
                </select>
               </li>
              <li onClick={this.changeSorting.bind(this, 'language')} className={cx({ 'sort-item': true, 'active': (this.state.sortListBy === 'language')})}>
                <select value={this.state.sortListBy !== 'language' ? '' : this.state.sortListValue} onChange={this.changeSorting.bind(this, 'language')}>
                  <option value="">- Language -</option>
                  {this.state.languagesList.map((lang, i) => 
                    <option value={lang} key={i}>{this.parseLanguage(lang)}</option>
                  )}
                </select>
              </li>
              <li onClick={this.changeSorting.bind(this, 'mandatory')} className={cx({ 'sort-item': true, 'active': (this.state.sortListBy === 'mandatory')})}>
                <select value={this.state.sortListBy !== 'mandatory' ? '' : this.state.sortListValue} onChange={this.changeSorting.bind(this, 'mandatory')}>
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
  CoursesList: [],
  TagsList: [],
  LanguagesList: [],
  SortListBy: '',
  SortListValue: '',
}

CoursesList.propTypes = {
  listTitle: PropTypes.string,
  coursesList: PropTypes.array,
  TagsList: PropTypes.array,
  LanguagesList: PropTypes.array,
  SortListBy: PropTypes.string,
  SortListValue: PropTypes.string,
};

export default CoursesList;
