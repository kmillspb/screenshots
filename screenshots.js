//TODO squish em https://www.npmjs.com/package/kraken-api
//TODO zip em https://www.npmjs.com/package/archiver

const puppeteer = require('puppeteer');

let argv = require('minimist')(process.argv.slice(2));
//console.dir(argv);

if (typeof argv.branch !== "string") {
    console.error('please provide branch (e.g. --branch="BO-123")');
    process.exit(1);
}

if (typeof argv.gituser !== "string") {
    console.error('please provide git user name (e.g. tobyj');
    process.exit(1);
}

let sitesToRun = false; //will run all by default

if (typeof argv.sites === "string") {
    console.log('Running on specific sites...\n');
    sitesToRun = argv.sites.split(',').map(function (item) {
        return item.trim();
    });
    if (!sitesToRun.length) {
        console.error('please provide valid sites [optional] (e.g. --sites="bonds,berlei")');
        process.exit(1);
    }
} else {
    console.log('Running on all sites...\n');
}

const baseUrl = "https://pbauardev1.pacificbrands.local/test/";
//const baseUrl = "https://"; //localdev
//const baseUrl = "https://test."; //test
//const baseUrl = "https://www."; //www

const gitUser = argv.gituser;
const branch = argv.branch;

const sites = [
    {
        siteName: "bonds",
        domain: "bonds.com.au",
        pagePaths: [
            {
                type: "clp",
                path: "womens.html"
            },
            {
                type: "pdp",
                path: "hipster-bikini-w0149i-ntv.html", //choose a pdp with stock
            },
        ]
    }, {
        siteName: "berlei",
        domain: "berlei.com.au",
        pagePaths: [
            {
                type: "clp",
                path: "bras.html"
            },
            {
                type: "pdp",
                path: "barely-there-contour-bra-y250n-o32.html",
            },
        ]
    },
    {
        siteName: "bondsoutlet",
        domain: "bondsoutlet.com.au",
        pagePaths: [
            {
                type: "clp",
                path: "womens.html"
            },
            {
                type: "pdp",
                path: "hipster-hot-shortie-wxbqa-26v.html",
            },
        ]
    },
    {
        siteName: "champion",
        domain: "championusa.com.au",
        pagePaths: [
            {
                type: "clp",
                path: "men.html"
            },
            {
                type: "pdp",
                path: "champion-performance-cap-ac183-1000.html",
            },
        ]
    },
    {
        siteName: "jockey",
        domain: "jockey.com.au",
        pagePaths: [
            {
                type: "clp",
                path: "men.html"
            },
            {
                type: "pdp",
                path: "cool-force-trunk-myfn1z-nrq.html",
            },
        ]
    },
    {
        siteName: "playtex",
        domain: "playtex.com.au",
        pagePaths: [
            {
                type: "clp",
                path: "underwire-bras.html"
            },
            {
                type: "pdp",
                path: "floral-delustre-underwire-y1035h-011.html",
            },
        ]
    },
    {
        siteName: "maidenform",
        domain: "maidenform.com.au",
        pagePaths: [
            {
                type: "ui",
                path: "ui"
            },
            {
                type: "iclp",
                path: "bras-by-category"
            },
            {
                type: "clp",
                path: "bras/shop-style/contour.html"
            },
            {
                type: "pdp",
                path: "love-the-lift-custom-push-up-yxxr-prp.html",
            },
        ]
    },
    {
        siteName: "totallytights",
        domain: "totallytights.com.au",
        pagePaths: [
            {
                type: "ui",
                path: "ui"
            },
            {
                type: "clp",
                path: "bras.html" //todo tights.html
            },
            {
                type: "pdp",
                path: "touch-sheers-h3049o-nuq.html", //todo update once live
            },
        ]
    },
    {
        siteName: "sheridan",
        domain: "sheridan.com.au",
        options: {
            sizeSelector: "select.qty:not(:disabled)"
        },
        pagePaths: [
            {
                type: "top-clp",
                path: "bedroom.html"
            },
            {
                type: "clp",
                path: "bedroom/quilt-covers.html"
            },
            {
                type: "pdp",
                path: "abbotson-linen-tailored-quilt-cover-s28p-b110-c195-796-toile.html",
            },
        ]
    },
    {
        siteName: "sheridanoutlet",
        domain: "sheridanoutlet.com.au",
        options: {
            sizeSelector: "select.qty:not(:disabled)"
        },
        pagePaths: [
            {
                type: "clp",
                path: "bedroom.html"
            },
            {
                type: "pdp",
                path: "sheridan-everyday-linen-quilt-cover-set-o612-b110-c242-012-flax.html",
            },
        ]
    },
    /*
    {
        siteName: "dunlopillo"
    },
    {
        siteName: "fairydown"
    }
    */
];


let commonPaths = [
    "home",
    "quickcheckout", //empty cart page
];

if (typeof argv.paths === "string") {
    console.log('On specific paths.\n');
    commonPaths = [];
    commonPaths = argv.paths.split(',').map(function (item) {
        return item.trim();
    });

} else {
    console.log('On all paths.\n');
}


//@see
const devices = require('puppeteer/DeviceDescriptors');
const testDevices = [
    devices['Nexus 10'],
    devices['iPhone 6'],
    devices['iPad'],
    {
        'name': 'Desktop',
        'userAgent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/604.5.6 (KHTML, like Gecko) Version/11.0.3 Safari/604.5.6',
        'viewport': {
            'width': 1300,
            'height': 2000,
            'deviceScaleFactor': 2,
            'isMobile': false,
            'hasTouch': false
        }
    }
];


(async () => {
    const browser = await puppeteer.launch({
        ignoreHTTPSErrors: true,
        //headless: false,
    });

    for (let site of sites) {

        if (sitesToRun && !sitesToRun.includes(site.siteName)) {
            continue;
        }

        //we van make this overridable in each site's options below
        let sizeSelector = '.super-attribute-select';

        if (site.options && site.options.sizeSelector) {
            sizeSelector = site.options.sizeSelector;
        }

        const page = await browser.newPage();

        page.setDefaultNavigationTimeout(45000);//bloody sheridan

        //pbauardev1:
        let branchUrlToTest = baseUrl + gitUser + '/' + branch + '/' + site.siteName + '/';
        //localDev
        //let branchUrlToTest = baseUrl + site.siteName + '.local/';
        //Production
        //let branchUrlToTest = baseUrl + site.siteName + '.local/';

        console.log('Testing ' + branchUrlToTest);

        for (let testDevice of testDevices) {

            await page.emulate(testDevice).then(() => console.log(testDevice.name)).catch((error) => {
                console.error('ERROR 2');
                console.error(error);
            });

            for (let path of commonPaths) {

                if (!path) {
                    continue;
                }

                console.log('path: ' + path);

                let filename = path.replace('/', '_').replace('.', '_');


                if (path === "quickcheckout") {

                    //wait until checkout is loaded (it should be empty)

                    let sUrl = branchUrlToTest + 'quickcheckout';
                    await page.goto(sUrl).then(() => console.log('1Go to ', sUrl)).catch((error) => {
                        console.error('ERROR 1');
                        console.error(error);
                    });

                    //for (let testDevice of testDevices) {



                    if (await page.waitForSelector('#tjcheckout:not(.isloading)').catch((error) => {
                            console.error('ERROR 3');
                            console.error(error);
                        })) {
                        console.log('checkout loaded');
                    } else {
                        console.log('checkout not loaded');
                    }

                    await page.waitFor(500).then(() => console.log('qc wait over...')).catch((error) => {
                        console.error('ERROR 4');
                        console.error(error);
                    });

                    await page.screenshot({path: site.siteName + '__' + testDevice.name + '__' + path + '.png'})
                        .then(() => console.log('Quickcheckout ' + ' [' + testDevice.name + ' screenshot taken: ' + site.siteName)).catch((error) => {
                            console.error('ERROR 5');
                            console.error(error);
                        });
                    //}

                } else {

                    //regular old page

                    if (path === "home") {
                        //just go to / (home redirects to prod)
                        await page.goto(branchUrlToTest).then(() => console.log('2Go to ', branchUrlToTest)).catch((error) => {
                            console.error('ERROR 6');
                            console.error(error);
                        });
                    } else {
                        await page.goto(branchUrlToTest + path).then(() => console.log('3Go to ', branchUrlToTest + path)).catch((error) => {
                            console.error('ERROR 7');
                            console.error(error);
                        });
                    }

                    //for (let testDevice of testDevices) {

                    //await page.emulate(testDevice).then(() => console.log(testDevice.name)).catch((error) => {
                    //    console.error('ERROR 8');
                    //    console.error(error);
                    //});

                    await page.waitFor(1000).catch((error) => {
                        console.error('ERROR 9');
                        console.error(error);
                    });

                    await page.screenshot({path: site.siteName + '__' + testDevice.name + '__' + filename + '.png'})
                        .then(() => console.log('site:' + site.siteName + ', path:' + path + ', device:' + testDevice.name + ', filename:' + filename + ' - screenshot taken')).catch((error) => {
                            console.error('ERROR 10');
                            console.error(error);
                        });
                    //}

                }

            }

            if (typeof site.pagePaths === "undefined" || typeof argv.paths === "string") {
                continue;
            }


            for (let pp of site.pagePaths) {

                //for (let testDevice of testDevices) {

                //await page.emulate(testDevice).then(() => console.log('...emulating', testDevice.name)).catch((error) => {
                //    console.error('ERROR 14');
                //    console.error(error);
                //});

                await page.goto(branchUrlToTest + pp.path).then(() => console.log('4Go to ', branchUrlToTest + pp.path)).catch((error) => {
                    console.error('ERROR 6');
                    console.error(error);
                });

                if (pp.type === "pdp") {

                    if (await page.waitForSelector(sizeSelector).catch((error) => {
                            console.error('ERROR 13', pp.type);
                            console.error(error);
                        })) {

                        await page.evaluate(x => {

                            function setFirstValidValueFromSelect(selector) {
                                let val = 0;
                                let sizeSel = document.querySelectorAll(selector);
                                if (sizeSel.length) {
                                    let opts = [...sizeSel[0].getElementsByTagName('option')];
                                    let validOpts = opts.filter(opt => (opt.value && !opt.disabled));
                                    if (validOpts.length) {
                                        val = validOpts.pop().value;
                                        sizeSel[0].value = val;
                                    }
                                }
                                return val;
                            }

                            if (setFirstValidValueFromSelect(x)) {
                                document.querySelector('.btn-cart').click();
                                return true;
                            } else {
                                return false;
                            }
                        }, sizeSelector).then(async (x) => {

                            console.log('Add to cart: ', x);

                            if (x) {

                                await page.waitForSelector('.product-cart-message.success').then(() => console.log('success message is visible...')).catch((error) => {
                                    console.error('ERROR 15');
                                    console.error(error);
                                });

                                await page.waitFor(1000).then(() => console.log('pdp add wait 1 over...')).catch((error) => {
                                    console.error('ERROR 16');
                                    console.error(error);
                                });

                                await page.screenshot({path: site.siteName + '__' + testDevice.name + '__' + pp.type + '_addToCart.png'})
                                    .then(() => console.log(pp.type + ' screenshot taken: ' + site.siteName)).catch((error) => {
                                        console.error('ERROR 17');
                                        console.error(error);
                                    });

                                //const page = await browser.newPage();

                                //now show populated quickcheckout:

                                let sUrl = branchUrlToTest + 'quickcheckout';
                                await page.goto(sUrl).catch((error) => {
                                    console.error('ERROR 18');
                                    console.error(error);
                                });
                                console.log('Going to ' + sUrl + '...');

                                await page.waitForSelector('#tjcheckout:not(.isloading)').catch((error) => {
                                    console.error('ERROR 19');
                                    console.error(error);
                                }).then(async () => {

                                    await page.waitFor(1000).then(() => console.log('wait over...')).catch((error) => {
                                        console.error('ERROR 20');
                                        console.error(error);
                                    });

                                    await page.screenshot({path: site.siteName + '__' + testDevice.name + '__' + 'quickcheckout_populated' + '.png'})
                                        .then(() => console.log('Quickcheckout screenshot taken: ' + site.siteName)).catch((error) => {
                                            console.error('ERROR 21');
                                            console.error(error);
                                        });
                                })

                            }


                        }).catch((error) => {
                            console.error('PDP ERROR');
                            console.error(error);
                        });


                    } else {
                        console.log('add to cart failed.');
                    }


                } else {
                    //not pdp:

                    await page.screenshot({path: site.siteName + '__' + testDevice.name + '__' + pp.type + '.png'}).then(() => console.log(site.siteName + '__' + testDevice.name + '__' + pp.type + '.png')).catch((error) => {
                        console.error('ERROR 12');
                        console.error(error);
                    });

                }
                //}
            }
        }
    }

    await browser.close().catch((error) => {
        console.error('ERROR 22');
        console.error(error);
    });
})();

/*

//just quickcheckout

puppeteer.launch({
    ignoreHTTPSErrors: true,
    headless: false,
}).then(async browser => {
    let site;

    for (site of sites) {
        const page = await browser.newPage();

        let sUrl = baseUrl + gitUser + '/' + branch + '/' + site.siteName + '/quickcheckout';
        await page.goto(sUrl);
        console.log('Going to ' + sUrl + '...');

        if (await page.waitForSelector('#tjcheckout:not(.isloading)')) {
            console.log('checkout loaded');
        } else {
            console.log('checkout not loaded');
        }

        await page.waitFor(500).then(()=>console.log('wait over...'));

        await page.screenshot({path: site.siteName + '__' + 'quickcheckout' + '.png'})
            .then(() => console.log('Quickcheckout screenshot taken: ' + site.siteName));
    }
    await browser.close();
});
*/