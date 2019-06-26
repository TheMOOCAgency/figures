import React, { Component } from 'react';
import classNames from 'classnames/bind';
import styles from './_header-content-course.scss';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
// TMA imports
import ReactTooltip from 'react-tooltip'

let cx = classNames.bind(styles);

class CustomTooltip extends Component {

  render() {
    const { active } = this.props;

    if (active) {
      const { payload } = this.props;
      return (
        <div className={styles['bar-tooltip']}>
          <span className={styles['tooltip-value']}>{payload[0].value}</span>
          <p>learners currently at this section</p>
        </div>
      );
    }

    return null;
  }
}

class HeaderContentCourse extends Component {

  parseCourseDate = (fetchedDate) => {
    if (fetchedDate === null) {
      return "-";
    } else if (Date.parse(fetchedDate)) {
      let tempDate = new Date(fetchedDate);
      tempDate = (tempDate.getMonth()+1) +'-'+ tempDate.getDate() +'-'+ tempDate.getFullYear();
      return tempDate;
    } else {
      return fetchedDate;
    }
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

  courseInfoTooltip() {
    return (
      'Date : ' + (this.props.isSelfPaced ? 
        'self-paced' : 
        (this.parseCourseDate(this.props.startDate) 
        + (this.props.endDate ? (' - ' + this.parseCourseDate(this.props.endDate)) : ' - No end date')
        ))
        + '<br/>' +
      'Mandatory : ' + (this.props.isMandatory ? 'Yes' : 'No') + '<br/>' +
      'Tag : ' + this.props.tag + '<br/>' +
      'Language : ' + this.parseLanguage(this.props.language) + '<br/>' + 
      'Target : ' + (this.props.isManagerOnly ? 'Manager Only' : 'No restriction') + '<br/>' +
      'Score required : ' + (this.props.requiredGrade * 100).toString() + '%<br/>'
    )
  }

  render() {
    const displayCourseHeaderGraph = false;

    return (
      <section className={styles['header-content-course']}>
        <div className={cx({ 'main-content': true, 'container': true})}>
          {/*<div className={styles['course-info']}>
            SCHEDULE : 
            {this.props.isSelfPaced ?
              <span> This course is self-paced</span>
             :
              <span>
                {' ' + this.parseCourseDate(this.props.startDate)}
                {this.props.endDate ? ' - ' + this.parseCourseDate(this.props.endDate) : ' - No end date'}
              </span>
            }
          </div>
          */}
          <div className={styles['course-title']}>
            {this.props.courseName}
          </div>
          {/*<div className={styles['course-id']}>
            Course ID : {this.props.courseId}
          </div>
          <div className={styles['course-likes']}>
            {this.props.likesTotal} likes
            </div>*/}
          <div className={styles['course-codes']}>{this.props.courseCode} | {this.props.microsite} | {this.props.tag} |
            <img
              data-for="header-tooltip"
              data-tip={this.courseInfoTooltip()}
              data-multiline={true}
              src="/static/tma-static/images/information-white.png"
              alt="info"
              className={styles['info-img']}
            />
          </div>
          <ReactTooltip id="header-tooltip"/>
          {displayCourseHeaderGraph ? [
            <span className={styles['text-separator']} />,
            <div className={styles['learners-info']}>
              <strong>{this.props.learnersEnrolled && this.props.learnersEnrolled['current_month']}</strong> learners currently enrolled, progressing through sections as displayed below:
            </div>
          ] : (
            <span className={styles['graph-bottom-padding']} />
          )}
        </div>
        {displayCourseHeaderGraph ? [
          <div className={cx({ 'graph-bars-container': true, 'container': true})}>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart
                data={this.props.data}
                margin={{top: 0, bottom: 0, left: 0, right: 0}}
                barCategoryGap={4}
              >
                <Tooltip
                  content={<CustomTooltip/>}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.15)'}}
                  offset={0}
                />
                <Bar dataKey='value' stroke='none' fill='#ffffff' fillOpacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>,
          <div className={styles['graph-labels-wrapper']}>
            <div className={cx({ 'graph-labels-container': true, 'container': true})}>
              <ResponsiveContainer width="100%" height={100}>
                <BarChart
                  data={this.props.data}
                  margin={{top: 0, bottom: 0, left: 0, right: 0}}
                  barCategoryGap={4}
                >
                  <XAxis
                    dataKey='lessonTitle'
                    axisLine={false}
                    tickLine={false}
                    height={100}
                    angle={90}
                    textAnchor="start"
                    interval={0}
                    //tick={<CustomXAxisLabel />}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ] : ""}
      </section>
    );
  }
}

HeaderContentCourse.defaultProps = {
  data: [
    {
      lessonTitle: 'Lesson 1',
      lessonSubtitle: 'Something something something',
      value: 12
    },
    {
      lessonTitle: 'Lesson 2',
      lessonSubtitle: 'Something something something something',
      value: 19
    },
    {
      lessonTitle: 'Lesson 3',
      lessonSubtitle: 'Something something',
      value: 38
    },
    {
      lessonTitle: 'Lesson 4',
      lessonSubtitle: 'Something something something',
      value: 31
    },
    {
      lessonTitle: 'Lesson 5',
      lessonSubtitle: 'Something something something',
      value: 59
    },
    {
      lessonTitle: 'Lesson 6',
      lessonSubtitle: 'Something something something',
      value: 12
    },
    {
      lessonTitle: 'Lesson 7',
      lessonSubtitle: 'Something',
      value: 14
    },
    {
      lessonTitle: 'Lesson 8',
      lessonSubtitle: 'Something something something',
      value: 7
    },
    {
      lessonTitle: 'Lesson 9',
      lessonSubtitle: 'Something something something',
      value: 9
    },
    {
      lessonTitle: 'Lesson 10',
      lessonSubtitle: 'Something something something',
      value: 16
    },
    {
      lessonTitle: 'Lesson 11',
      lessonSubtitle: 'Something something something',
      value: 22
    },
    {
      lessonTitle: 'Lesson 12',
      lessonSubtitle: 'Something something something',
      value: 12
    },
    {
      lessonTitle: 'Lesson 13',
      lessonSubtitle: 'Something something something',
      value: 3
    },
    {
      lessonTitle: 'Lesson 14',
      lessonSubtitle: 'Something something something',
      value: 14
    },
    {
      lessonTitle: 'Lesson 15',
      lessonSubtitle: 'Something something something',
      value: 30
    },
    {
      lessonTitle: 'Lesson 16',
      lessonSubtitle: 'Something something something',
      value: 14
    }
  ]
}

export default HeaderContentCourse;
