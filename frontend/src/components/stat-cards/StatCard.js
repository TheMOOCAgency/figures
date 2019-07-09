import React, { Component } from 'react';
//import PropTypes from 'prop-types';
//import Immutable from 'immutable';
import styles from './_base-stat-card.scss';
//import classNames from 'classnames/bind';
import { ResponsiveContainer, BarChart, Bar, XAxis } from 'recharts';

class StatCard extends Component {
    render() {
        return(
            <div className={styles['learner-stat-card']}>
                <span>{this.props.title}</span>
                <ResponsiveContainer>
                <BarChart width={730} height={250} layout='vertical' data={this.props.data}>
                    <XAxis type="number" dataKey="grade" />
                    <XAxis type="category" dataKey="right" />
                    <Bar dataKey="right" fill="#8884d8" />
                    <Bar dataKey="grade" fill="#82ca9d" />
                </BarChart>
                </ResponsiveContainer>
            </div>
        )
    }
}

export default StatCard;