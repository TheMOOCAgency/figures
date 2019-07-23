import React, { Component } from 'react';
import styles from './_reports-box.scss';

class ReportsBox extends Component {
    constructor(props) {
        super(props);

        this.state = {
            gradeReports: [],
            downloadStatus: '',
            lastReport: {}
        };

        this.generateGradeReport = this.generateGradeReport.bind(this);
    }

    getFetchOptions = () => {
        // Options for API calls
        return { credentials: "same-origin", method: "POST", headers: {
            'X-CSRFToken': window.csrf
        }
        };
    }

    generateGradeReport = () => {
        // Launch report task
        fetch('/courses/'+ this.props.courseId +'/instructor/api/problem_grade_report', this.getFetchOptions())
        .then(response => response.json())
        .then(() => {
        // Set status and get initial report list
        this.setState({downloadStatus: "Your report is being generated, please wait."});
        this.getReportsList();
        }); 
    }

    getReportsList = () => {
        // Fetch initial report list
        fetch('/courses/'+this.props.courseId+'/instructor/api/list_report_downloads', this.getFetchOptions())
        .then(response => response.json())
        .then((json) => {
        this.setState({
            gradeReports: json.downloads
        });
        // Then wait for new report to be uploaded
        this.checkReportList();
        });
    }

    checkReportList = () => {
        const courseId = this.props.courseId;
        const options = this.getFetchOptions();
        const reports = this.state.gradeReports;
        const update = this.updateReportsList;
        // Check when report list has new report - means that task is done
        let intervalID = setInterval(function(){
        fetch('/courses/'+ courseId +'/instructor/api/list_report_downloads', options)
        .then(response => response.json())
        .then((json) => {
            // If new report in list, set state and clear interval
            if (json.downloads.length > reports.length) {
                update(json.downloads);
                clearInterval(intervalID);
            }
        })
        }, 500)
    }

    updateReportsList = (reports) => {
        this.setState({
            gradeReports: reports,
            lastReport: reports[0],
            downloadStatus: "To download the report, please click the link :"
        });
    }

    render() {
        return (
            <div>
                <div className={styles['report-box']}>
                    <span className={styles['download-btn']} onClick={this.generateGradeReport}>Download report</span>
                </div>
                <div className={styles['report-box']}>
                    <span className={styles['report-link']}>{this.state.downloadStatus}</span>
                </div>
                <div className={styles['report-box']}>
                    {this.state.lastReport && <a className={styles['report-link']} href={this.state.lastReport.url}>{this.state.lastReport.name}</a>}
                </div>
            </div>
        )
    }
}

export default ReportsBox;