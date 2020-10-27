import React, { Component } from "react";
import styles from "./_reports-box.scss";

class ReportsBox extends Component {
  constructor(props) {
    super(props);

    this.state = {
      gradeReports: [],
      downloadStatus: "",
      generatingReport: false,
      lastReport: null,
    };

    this.generateGradeReport = this.generateGradeReport.bind(this);
    this.getReportsList = this.getReportsList.bind(this);
  }

  getFetchOptions = () => {
    // Options for API calls
    return {
      credentials: "same-origin",
      method: "POST",
      headers: {
        "X-CSRFToken": window.csrf,
      },
    };
  };

  generateGradeReport = () => {
    // Launch report task
    fetch(
      "/courses/" +
        this.props.courseId +
        "/instructor/api/problem_grade_report",
      this.getFetchOptions()
    )
      .then((response) => response.json())
      .then(() => {
        // Set status and get initial report list
        this.setState({
          downloadStatus: "Your report is being generated, please wait.",
          generatingReport: true,
        });
        this.checkReportList();
      });
  };

  checkReportList = () => {
    const courseId = this.props.courseId;
    const options = this.getFetchOptions();
    const reports = this.state.gradeReports;
    const update = this.updateReportsList;
    // Check when report list has new report - means that task is done
    let intervalID = setInterval(function () {
      fetch(
        "/courses/" + courseId + "/instructor/api/list_report_downloads",
        options
      )
        .then((response) => response.json())
        .then((json) => {
          // If new report in list, set state and clear interval
          if (json.downloads.length > reports.length) {
            update(json.downloads);
            clearInterval(intervalID);
          }
        });
    }, 2000);
  };

  updateReportsList = (reports) => {
    this.setState({
      gradeReports: reports,
      lastReport: reports[0],
      downloadStatus: "",
      generatingReport: false,
    });
  };

  getReportsList = () => {
    fetch(
      "/courses/" +
        this.props.courseId +
        "/instructor/api/list_report_downloads",
      this.getFetchOptions()
    )
      .then((response) => response.json())
      .then((json) => {
        this.setState({
          gradeReports: json.downloads,
          lastReport: json.downloads[0],
        });
      });
  };

  renderProgramReportHeader = () => {
    if (this.state.lastReport && this.state.lastReport.url) {
      return (
        <div className={styles["header-report"]}>
          <div className={styles["report-box"]}>
            <a
              className={styles["download-btn"]}
              href={this.state.lastReport.url}
            >
              download program report
            </a>
          </div>
          <div className={styles["report-box"]}>
            <span className={styles["report-info"]}>
              Program reports are updated on a daily basis.
            </span>
          </div>
        </div>
      );
    } else {
      return (
        <div className={styles["header-report"]}>
          <div className={styles["report-box"]}>
            <span className={styles["disabled-btn"]}>
              download program report
            </span>
          </div>
          <div className={styles["report-box"]}>
            <span className={styles["report-info"]}>
              Program reports are updated on a daily basis, so report should be
              available by tomorrow.
            </span>
          </div>
        </div>
      );
    }
  };

  renderCourseReportHeader = () => {
    if (this.props.learnersEnrolled < 100) {
      return (
        <div className={styles["header-report"]}>
          <div className={styles["report-box"]}>
            <span
              className={styles["download-btn"]}
              onClick={this.generateGradeReport}
            >
              generate new report
            </span>
          </div>
          <div className={styles["report-box"]}>
            <span className={styles["report-info"]}>
              Please do not click this button several times. It would only slow
              down report generation with multiple reports being generated.
              <br />
              For large courses, report generation may take more than one hour.
            </span>
          </div>
          <div className={styles["report-box"]}>
            {this.state.lastReport ? (
              this.state.generatingReport || !this.state.lastReport.url ? (
                <span className={styles["disabled-btn"]}>download report</span>
              ) : (
                <a
                  className={styles["download-btn"]}
                  href={
                    !this.state.generatingReport && this.state.lastReport.url
                  }
                >
                  download report
                </a>
              )
            ) : (
              <p className={styles["report-link"]}>
                There is no generated report yet.
              </p>
            )}
          </div>
          <div className={styles["report-box"]}>
            <span className={styles["report-link"]}>
              {this.state.downloadStatus}
            </span>
          </div>
        </div>
      );
    } else {
      if (this.state.lastReport && this.state.lastReport.url) {
        return (
          <div className={styles["header-report"]}>
            <div className={styles["report-box"]}>
              <a
                className={styles["download-btn"]}
                href={this.state.lastReport.url}
              >
                download report
              </a>
            </div>
            <div className={styles["report-box"]}>
              <span className={styles["report-info"]}>
                This report updated on a daily basis.
              </span>
            </div>
          </div>
        );
      } else {
        return (
          <div className={styles["header-report"]}>
            <div className={styles["report-box"]}>
              <span className={styles["disabled-btn"]}>download report</span>
            </div>
            <div className={styles["report-box"]}>
              <span className={styles["report-info"]}>
                This report is updated on a daily basis, so it should be
                available by tomorrow.
              </span>
            </div>
          </div>
        );
      }
    }
  };

  componentDidUpdate() {
    if (this.state.lastReport === null) {
      this.getReportsList();
    }
  }

  render() {
    return (
      <div>
        {this.props.isProgramCourse
          ? this.renderProgramReportHeader()
          : this.renderCourseReportHeader()}
      </div>
    );
  }
}

export default ReportsBox;
