const exceptionSites = {
	'champion': {
		'test': 'https://test.championusa.com.au',
		'prod': 'https://www.championusa.com.au',
		'dev': 'https://champion.local'
	},
	'sheridanuk': {
		'test': 'https://test.sheridanaustralia.co.uk',
		'prod': 'https://www.sheridanaustralia.co.uk',
		'dev': 'https://sheridanuk.local'
	},
	'fairydown': {
		'test': 'https://test.fairydownbedware.co.nz',
		'prod': 'https://www.fairydownbedware.co.nz',
		'dev': 'https://fairydownbedwarenz.local'
	}
};

const baseUrl = "https://pbauardev1.pacificbrands.local/test/";

const TEST_ENVIRONMENT = "test";
const BRANCH_ENVIRONMENT = "branch";
const PROD_ENVIRONMENT = "prod";
const DEV_ENVIRONMENT = "dev";

let getSiteUrl = (site, environment) => {
	if (environment === TEST_ENVIRONMENT) {
		return `https://test.${site}.com.au/`;
	} else if (environment === PROD_ENVIRONMENT) {
		return `https://www.${site}.com.au/`;
	}

	return `https://${site}.local/`;
};

module.exports = {
	TEST_ENVIRONMENT: TEST_ENVIRONMENT,
	BRANCH_ENVIRONMENT: BRANCH_ENVIRONMENT,
	PROD_ENVIRONMENT: PROD_ENVIRONMENT,
	DEV_ENVIRONMENT: DEV_ENVIRONMENT,
	getBranchUrl: (gitUser, branch, siteName) => {
		return `${baseUrl}${gitUser}/${branch}/${siteName}/`;
	},
	getUrl: (site, environment) => {
		if (site in exceptionSites){
			return exceptionSites[site][environment] + "/";
		}

		return getSiteUrl(site, environment);
	}
};