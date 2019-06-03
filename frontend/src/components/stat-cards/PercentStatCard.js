import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './_base-stat-card.scss';
import classNames from 'classnames/bind';

let cx = classNames.bind(styles);


class PercentStatCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      cardWidth: this.props.cardWidth,
    };
  }

  render() {

    return (
      <div className={cx({ 'stat-card': true, 'span-2': (this.state.cardWidth === 2), 'span-3': (this.state.cardWidth === 3), 'span-4': (this.state.cardWidth === 4)})}>
        <div className={styles['main-content']}>
          <span className={styles['card-title']}>{this.props.cardTitle}</span>
          {(this.props.cardDescription !== '') && (
            <span className={styles['card-description']}>
              {this.props.cardDescription}
            </span>
          )}
          <div className={styles['main-data-container']}>
            {this.props.singleValue ? (
              <span className={styles['current-data']}>{this.props.mainValue}</span>
            ) : (
              <span className={styles['current-data']}>{(this.props.dataType === 'percentage') ? (this.props.mainValue)*100 : (this.props.mainValue)}{(this.props.dataType === 'percentage') && '%'}</span>
            )}
            {(this.props.compareToPrevious && !this.props.singleValue) && (
              <div className={styles['previous-comparison']}>
                <span className={styles['comparison-value']}>{(this.props.dataType === 'percentage') && '%'}</span>
                <span className={styles['comparison-text']}>{this.props.replaceText ? this.props.replaceText : "since last month"}</span>
              </div>
            )}
          </div>
          {(this.props.enableHistory && !this.props.singleValue) ? (
            <button onClick={this.historyToggle} className={styles['history-toggle']}>{this.state.historyExpanded ? 'hide history' : 'see history'}</button>
          ) : (
            <span className={styles['history-toggle-faux']}></span>
          )}
        </div>
      </div>
    )
  }
}

PercentStatCard.defaultProps = {
  cardTitle: 'Test stat title',
  cardDescription: '',
  cardWidth: 1,
  compareToPrevious: true,
  dataType: 'number',
  singleValue: false,
  mainValue: 0,
}

PercentStatCard.propTypes = {
  cardTitle: PropTypes.string,
  cardDescription: PropTypes.string,
  cardWidth: PropTypes.number,
  dataType: PropTypes.string,
  mainValue: PropTypes.number,
  compareToPrevious: PropTypes.bool,
  singleValue: PropTypes.bool,
};

export default PercentStatCard;
