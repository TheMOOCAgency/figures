import React, { Component } from 'react';
//import PropTypes from 'prop-types';
//import Immutable from 'immutable';
import styles from './_base-stat-card.scss';
//import classNames from 'classnames/bind';
import { ResponsiveContainer, BarChart, Bar } from 'recharts';

class StatCard extends Component {
    render() {
        return(
            <div className={styles['learner-stat-card']}>
                <span>Title</span>
            </div>
        )
    }
}

export default StatCard;