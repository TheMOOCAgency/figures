'''Tests figures.pipeline.

TODO:

* Add tests for the individual field extractors
* Add test coverage for multisite mode
'''

import datetime
import pytest

from django.contrib.auth import get_user_model
from django.contrib.sites.models import Site
from django.utils.timezone import utc

from openedx.core.djangoapps.content.course_overviews.models import (
    CourseOverview,
)

from figures.helpers import as_datetime, prev_day, is_multisite
from figures.models import SiteDailyMetrics
from figures.pipeline import site_daily_metrics as pipeline_sdm
import figures.sites

from tests.factories import (
    CourseDailyMetricsFactory,
    CourseOverviewFactory,
    OrganizationFactory,
    OrganizationCourseFactory,
    SiteDailyMetricsFactory,
    UserFactory,
)

from tests.helpers import organizations_support_sites


if organizations_support_sites():
    from tests.factories import UserOrganizationMappingFactory


DEFAULT_START_DATE = datetime.datetime(2018, 1, 1, 0, 0, tzinfo=utc)
DEFAULT_END_DATE = datetime.datetime(2018, 3, 1, 0, 0, tzinfo=utc)

# Course Daily Metrics data
CDM_INPUT_TEST_DATA = [
    dict(
        enrollment_count=0,
        active_learners_today=0,
        average_progress=None,
        average_days_to_complete=None,
        num_learners_completed=0),
    dict(
        enrollment_count=50,
        active_learners_today=5,
        average_progress=0.25,
        average_days_to_complete=24,
        num_learners_completed=0),
    dict(
        enrollment_count=100,
        active_learners_today=10,
        average_progress=0.75,
        average_days_to_complete=12,
        num_learners_completed=5),
]

# Previous day's SiteDailyMetrics data
SDM_PREV_DAY = [
    None,
    dict(
        cumulative_active_user_count=50,
        todays_active_user_count=10,
        total_user_count=200,
        course_count=len(CDM_INPUT_TEST_DATA),
        total_enrollment_count=100,
    )
]

# Expected results for extracting data for SiteDailyMetrics
SDM_EXPECTED_RESULTS = dict(
    cumulative_active_user_count=65,
    todays_active_user_count=15,
    total_user_count=200,
    course_count=len(CDM_INPUT_TEST_DATA),
    total_enrollment_count=150,
    )


@pytest.mark.django_db
class TestCourseDailyMetricsMissingCdm(object):
    '''
    TODO: Do we want to add a test for when there are no courses?
    '''
    @pytest.fixture(autouse=True)
    def setup(self, db):
        self.date_for = DEFAULT_END_DATE
        self.site = Site.objects.first()
        self.course_count = 4
        self.course_overviews = [CourseOverviewFactory(
            created=self.date_for) for i in range(self.course_count)]
        if is_multisite():
            self.organization = OrganizationFactory(sites=[self.site])
            for co in self.course_overviews:
                OrganizationCourseFactory(organization=self.organization,
                                          course_id=str(co.id))

    def test_no_missing(self):
        [CourseDailyMetricsFactory(
            date_for=self.date_for,
            site=self.site,
            course_id=course.id) for course in self.course_overviews]
        course_ids = pipeline_sdm.missing_course_daily_metrics(
            site=self.site,
            date_for=self.date_for)
        assert course_ids == set([])

    def test_missing(self):
        [
            CourseDailyMetricsFactory(
                date_for=self.date_for,
                site=self.site,
                course_id=self.course_overviews[0].id),
            CourseDailyMetricsFactory(
                date_for=self.date_for,
                site=self.site,
                course_id=self.course_overviews[1].id),
        ]
        expected_missing = [unicode(co.id) for co in self.course_overviews[2:]]
        actual = pipeline_sdm.missing_course_daily_metrics(
            site=self.site, date_for=self.date_for)

        assert set([str(obj) for obj in actual]) == set(expected_missing)


@pytest.mark.django_db
class TestCourseDailyMetricsPipelineFunctions(object):
    '''
    Run tests on standalone methods in pipeline.site_daily_metrics
    '''
    @pytest.fixture(autouse=True)
    def setup(self, db):
        self.date_for = datetime.date(2018, 6, 1)
        self.site = Site.objects.first()
        self.cdm_recs = [CourseDailyMetricsFactory(
            site=self.site,
            date_for=self.date_for,
            **cdm
            ) for cdm in CDM_INPUT_TEST_DATA]

    def test_get_active_user_count_for_date(self):
        expected = SDM_EXPECTED_RESULTS['todays_active_user_count']
        actual = pipeline_sdm.get_active_user_count_for_date(
            site=self.site,
            date_for=self.date_for)
        assert actual == expected

    @pytest.mark.parametrize('prev_day_data, expected', [
        (SDM_PREV_DAY[0], 0,),
        (SDM_PREV_DAY[1], SDM_PREV_DAY[1]['cumulative_active_user_count'],),
    ])
    def test_get_previous_cumulative_active_user_count(self, prev_day_data, expected):
        if prev_day_data:
            SiteDailyMetricsFactory(
                site=self.site,
                date_for=prev_day(self.date_for),
                **prev_day_data)
        actual = pipeline_sdm.get_previous_cumulative_active_user_count(
            site=self.site,
            date_for=self.date_for)
        assert actual == expected

    def test_get_total_enrollment_count(self):
        expected = SDM_EXPECTED_RESULTS['total_enrollment_count']
        actual = pipeline_sdm.get_total_enrollment_count(
            site=self.site,
            date_for=self.date_for)
        assert actual == expected


@pytest.mark.django_db
class TestSiteDailyMetricsExtractor(object):
    '''
    TODO: We need to test with ``date_for`` as both for now and a time in the past
    '''
    @pytest.fixture(autouse=True)
    def setup(self, db):
        self.date_for = datetime.date(2018, 10, 1)
        self.site = Site.objects.first()
        self.users = [UserFactory(
            date_joined=as_datetime(self.date_for - datetime.timedelta(days=60))
            ) for i in range(0, 3)]
        self.course_overviews = [CourseOverviewFactory(
            created=as_datetime(self.date_for - datetime.timedelta(days=60))
            ) for i in range(0, 3)]
        self.cdm_recs = [CourseDailyMetricsFactory(
            site=self.site,
            date_for=self.date_for,
            **cdm
            ) for cdm in CDM_INPUT_TEST_DATA]
        self.prev_day_sdm = SiteDailyMetricsFactory(
            site=self.site,
            date_for=prev_day(self.date_for),
            **SDM_PREV_DAY[1])

        if is_multisite():
            self.organization = OrganizationFactory(sites=[self.site])
            for co in self.course_overviews:
                OrganizationCourseFactory(organization=self.organization,
                                          course_id=str(co.id))
            if organizations_support_sites():
                for user in self.users:
                    UserOrganizationMappingFactory(user=user,
                                                   organization=self.organization)

    def test_extract(self):
        expected_results = dict(
            cumulative_active_user_count=65,
            todays_active_user_count=15,
            total_user_count=len(self.users),
            course_count=len(CDM_INPUT_TEST_DATA),
            total_enrollment_count=150,
        )

        for course in figures.sites.get_courses_for_site(self.site):
            assert course.created.date() < self.date_for
        for user in figures.sites.get_users_for_site(self.site):
            assert user.date_joined.date() < self.date_for

        actual = pipeline_sdm.SiteDailyMetricsExtractor().extract(
            site=self.site,
            date_for=self.date_for)

        for key, value in expected_results.iteritems():
            assert actual[key] == value, 'failed on key: "{}"'.format(key)


@pytest.mark.django_db
class TestSiteDailyMetricsLoader(object):
    """
    Tests the site metrics loading for single site (standalone) deployments

    """
    FIELD_VALUES = dict(
                todays_active_user_count=1,
                cumulative_active_user_count=2,
                total_user_count=3,
                course_count=4,
                total_enrollment_count=5,
                )

    class MockExtractor(object):
        def extract(self, **kwargs):
            return TestSiteDailyMetricsLoader.FIELD_VALUES

    @pytest.fixture(autouse=True)
    def setup(self, db):
        pass

    def test_load_for_today(self):
        assert Site.objects.count() == 1
        assert SiteDailyMetrics.objects.count() == 0
        loader = pipeline_sdm.SiteDailyMetricsLoader(
            extractor=self.MockExtractor())
        site_metrics, created = loader.load(site=Site.objects.first())

        sdm = SiteDailyMetrics.objects.first()
        for key, value in self.FIELD_VALUES.iteritems():
            assert getattr(sdm, key) == value, 'failed on key: "{}"'.format(key)


    def test_no_course_overviews(self):
        """

        """
        assert SiteDailyMetrics.objects.count() == 0
        loader = pipeline_sdm.SiteDailyMetricsLoader
