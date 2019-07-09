import React, { Component } from 'react';
//import { Link } from 'react-router-dom';
import styles from './_learner-stats.scss';
//import classNames from 'classnames/bind';
import StatCard from '../stat-cards/StatCard'
import Papa from 'papaparse';
import report from '../../report.csv'

//let cx = classNames.bind(styles);

class LearnerStats extends Component {
    constructor(props) {
        super(props);
    
        this.state = {
            learnersData: [],
            courseStructure: []
        }
        this.getLearnersData = this.getLearnersData.bind(this)
        this.updateLearnersData = this.updateLearnersData.bind(this)
    };

    getLearnersData = () => {
        Papa.parse(report, {
          download: true,
          header: true,
          complete: this.updateLearnersData
        });
    }

    updateLearnersData(results) {
        this.setState({learnersData: results.data});
        this.getCourseStructure();
    }

    getCourseStructure = () => {
        const structure = []
        for (let [key] of Object.entries(this.state.learnersData[0])) {
            if (key.includes('Earned')) {
                structure.push(key)
            }
        }
        this.setState({courseStructure: structure})
    }

    render() {
        const courseStructure = this.state.courseStructure.map((question, i) => {
            return (
                <StatCard title={question} key={i} data={[{ right: 'a', grade: 12 }]}/>
            )
        })
        return (
            <div className={styles['course-learners-stats']}>
                <button className={styles['stat-tab']}>Per question</button>
                <button className={styles['stat-tab']}>Per participant</button>
                <button className={styles['stat-tab']} onClick={this.getLearnersData}>Update</button>
                <div className={styles['learners-stats-box']}>
                    {courseStructure}
                </div>
            </div>
        )
    }
};

export default LearnerStats;
