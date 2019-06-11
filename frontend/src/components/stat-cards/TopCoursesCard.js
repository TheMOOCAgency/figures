import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from './_base-stat-card.scss';
import classNames from 'classnames/bind';
//import { cpus } from 'os';

let cx = classNames.bind(styles);

class TopCoursesStatCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      cardWidth: this.props.cardWidth,
    };

  }

  getTopCourses() {
    // Getting Top 5 courses by number of likes
    let coursesList = this.props.coursesList;
    return coursesList.sortBy(item => item.getIn(['tma_course', 'liked_total'])).reverse().slice(0,5);
  }

  render() {
    const coursesListSliced = this.getTopCourses()
    const topItems = coursesListSliced.map((item, index) => {
        return (
            <div className={(index === 0) ? styles['top-one-value-box'] : styles['top-value-box']} key={index}>
              <span className={(index === 0) ? styles['top-one-value'] : styles['top-value']}>{index+1}</span>
              <Link to={'/figures/course/' + item.get('course_id')} className={styles['top-course-link']}>
                <span className={styles['top-course-name']}>{item.get('course_name')}</span>
              </Link>
            </div>
        )      
    });
    
    return (
      <div className={cx({ 'stat-card': true, 'span-2': (this.state.cardWidth === 2), 'span-3': (this.state.cardWidth === 3), 'span-4': (this.state.cardWidth === 4)})}>
        <div className={styles['main-content']}>
          <span className={styles['card-title']}>{this.props.cardTitle}</span>
          <div className={styles['top-courses-data-container']}>
            {topItems}
          </div>
        </div>
      </div>
    )
  }
}

TopCoursesStatCard.defaultProps = {
    cardTitle: 'Top courses:',
    cardWidth: 2,
    CoursesList: []
}
  
TopCoursesStatCard.propTypes = {
    cardTitle: PropTypes.string,
    cardWidth: PropTypes.number,
    coursesList: PropTypes.array
};

export default TopCoursesStatCard;