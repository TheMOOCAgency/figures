import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './_base-stat-card.scss';
import classNames from 'classnames/bind';
//import { cpus } from 'os';

let cx = classNames.bind(styles);

class ImageCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
        cardWidth: this.props.cardWidth,
    };
  }

  render() {
    return (
      <div className={cx({'transparent-stat-card': true, 'stat-card': false, 'span-2': (this.state.cardWidth === 2), 'span-3': (this.state.cardWidth === 3), 'span-4': (this.state.cardWidth === 4)})}>
        <div className={styles['main-content']}>
          <div className={styles['image-container']}>
            {/*<img src={this.props.cardImage} className={styles['card-img']} alt="phileas"></img>*/}
          </div>
        </div>
      </div>
    )
  }
}

ImageCard.defaultProps = {
    cardImage: "",
    cardWidth: 1
}
  
ImageCard.propTypes = {
    cardImage: PropTypes.string,
    cardWidth: PropTypes.number
};

export default ImageCard;