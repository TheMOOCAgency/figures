import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './_learner-stats.scss';
import classNames from 'classnames/bind';
import StatCard from '../stat-cards/StatCard'


let cx = classNames.bind(styles);

class LearnerStats extends Component {
    render() {
        return (
            <div className={styles['course-learners-stats']}>
                <button className={styles['stat-tab']}>Per question</button>
                <button className={styles['stat-tab']}>Per participant</button>
                <div className={styles['learners-stats-box']}>
                    <StatCard />
                </div>
            </div>
        )
    }
};

LearnerStats.defaultProps = {
};

LearnerStats.propTypes = {
};

export default LearnerStats;
