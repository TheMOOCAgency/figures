"""Unit tests for figures.admin

"""

import pytest

from django.contrib.admin.sites import AdminSite

import figures.admin

from figures.models import (
    CourseDailyMetrics,
    SiteDailyMetrics,
    LearnerCourseGradeMetrics,
    PipelineError,
    )

from tests.factories import (
    LearnerCourseGradeMetricsFactory,
    UserFactory,
    )


@pytest.mark.django_db
class TestModelAdminRepresentations(object):
    """Initial tests doing basic coverage

    """

    @pytest.fixture(autouse=True)
    def setup(self, db):
        self.admin_site = AdminSite()

    @pytest.mark.parametrize('model_class, model_admin_class', [
            (CourseDailyMetrics, figures.admin.CourseDailyMetricsAdmin),
            (SiteDailyMetrics, figures.admin.SiteDailyMetricsAdmin),
            (LearnerCourseGradeMetrics, figures.admin.LearnerCourseGradeMetricsAdmin),
            (PipelineError, figures.admin.PipelineErrorAdmin),
        ])
    def test_course_daily_metrics_admin(self, model_class, model_admin_class):
        obj = model_admin_class(model_class, self.admin_site)
        assert obj.list_display


@pytest.mark.django_db
class TestLearnerCourseGradeMetricsAdmin(object):
    """
    LearnerCourseGradesMetricsAdmin class has a member method to provide a link
    to the user page in admin
    """

    @pytest.fixture(autouse=True)
    def setup(self, db):
        self.admin_site = AdminSite()

    def test_user_link(self, monkeypatch):
        """Tests the two cases of user link
        A) there is a user in the record
        B) there is not a user in the record
        """
        mock_uri = '/mock-uri-to-user-admin-page'

        def mock_reverse(*args, **kwargs):
            return mock_uri

        users = [UserFactory(), UserFactory()]
        lcg_metrics = [
            LearnerCourseGradeMetricsFactory(user=users[0]),
            LearnerCourseGradeMetricsFactory(user=users[1])]
        admin_obj = figures.admin.LearnerCourseGradeMetricsAdmin(
            LearnerCourseGradeMetrics, self.admin_site)
        monkeypatch.setattr(figures.admin, 'reverse', mock_reverse)
        data = admin_obj.user_link(lcg_metrics[0])
        assert data == '<a href="{url}"></a>'.format(url=mock_uri)
        data = admin_obj.user_link(LearnerCourseGradeMetricsFactory(user=None))
        assert data == 'no user in this record'
