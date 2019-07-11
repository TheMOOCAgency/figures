import React, { Component } from 'react';
import styles from './_header-content-user.scss';

class HeaderContentUser extends Component {
  render() {

    return (
      <section className={styles['header-content-user']}>
        {/*<img src={this.props.image} alt={this.props.name} role="presentation" className={styles['user-image']} />*/}
        <span className={styles['user-name']}>{this.props.name}</span>
        <span className={styles['user-info']}><a href={"mailto:" + this.props.email}>{this.props.email}</a></span>
        <span className={styles['user-info']}>RPID : {this.props.rpid ? this.props.rpid : 'n/a'} | IUG : {this.props.iug ? this.props.iug : 'n/a'}</span>
      </section>
    );
  }
}

export default HeaderContentUser
