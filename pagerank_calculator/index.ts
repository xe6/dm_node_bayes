import * as createPageRank from './lib/pagerank';
import * as request from 'request';
import * as cheerio from 'cheerio';

const url = require("url");

import * as _ from 'lodash';

// GLOBAL CONSTANTS
const LINK_PROB = 0.5;
const TOLERANCE = 0.0001;

// GLOBAL VARS
class OutgoingLink {
    public id: number;
    public page: string;
    public outLinks: string[];
    public outLinkIndexes?: number[];

    constructor(data: OutgoingLink) {
        this.id = data.id;
        this.page = data.page;
        this.outLinks = data.outLinks;

        this.outLinkIndexes = data.outLinkIndexes || null;
    }
}

const allLinks: string[] = [];
const outgoingLinks: OutgoingLink[] = [];
let i: number = 0;


const getLinks = (html: string, pageLink: string): string[] => {
    const hostName = new URL(pageLink).hostname;
    // Creating html page txt
    const $ = cheerio.load(html);
    // Get all 'a' tags
    const links = $("a");
    let urls: string[] = [];

    // Getting all hrefs from a tag
    $(links).each((i, link) => {
        const href = $(link).attr("href");

        if (!href) return;

        // get absolute path to page URL
        const absoluteUrl = url.resolve(pageLink, href);

        urls.push(absoluteUrl);
    });

    // Get only internal http / https links
    const httpUrls = urls.filter(url => {
        const newUrl = new URL(url);
        return (
            (newUrl.protocol === "http:" || newUrl.protocol === "https:") &&
            newUrl.hostname === hostName
        );
    });

    // Remove all duplicates
    return _.uniq(httpUrls);
}

// Make request on the url to get html
const parsePage = (url: string): Promise<any> => {
    console.dir(url);
    return new Promise((resolve, reject) => {
        // jar - true: Fix "Exceeded maxRedirects. Probably stuck in a redirect loop"
        request({
            jar: true,
            url
        }, (err, res) => {
            if (err) return reject(err);

            try {
                resolve(getLinks(res.body, url));
            } catch (e) {
                reject(e);
            }
        });
    });
};

const getLinksFromAllPages = async (url: string) => {
    // if already visited - return
    if (allLinks.includes(url)) return;

    // push to already visited links in order to not make request again
    allLinks.push(url);

    // links from page
    const links = await parsePage(url);

    outgoingLinks.push(new OutgoingLink({
        id: i,
        // id: i + 1,
        page: url,
        outLinks: links
        // TODO: without itself link
        // do not include link on itself
        // outLinks: links.filter(str => str !== link)
    }));

    i++;

    // no more outgoing links - return
    if (links.length === 0) return;

    for (let link of links) {
        await getLinksFromAllPages(link);
    }
};


async function getOrientedGraphObject(pageLink: string): Promise<OutgoingLink[]> {
    await getLinksFromAllPages(pageLink);

    for (let ind in outgoingLinks) {
        const indexes = outgoingLinks[ind].outLinks.map(link => {
            // TODO: if url links to itself return 0
            if (link === outgoingLinks[ind].page) return null;

            const index = outgoingLinks.findIndex(linkObj => {
                return linkObj.page === link;
            });

            return index;
        });

        outgoingLinks[ind].outLinkIndexes = indexes;
    }

    return outgoingLinks;
}

const getGraphNodes = (graph: OutgoingLink[]) => {
    return graph.map(node => {
        return node.outLinkIndexes
    });
}

const getFirstTen = (pageRanks: any[], graph: any[]) => {
    const orderedRanks = _.orderBy(pageRanks, ['pageRank'], ['desc']).splice(0, 10);

    orderedRanks.forEach(rank => {
        graph.forEach(node => {
            if (rank.id === node.id) {
                rank.page = node.page
            }
        })
    });

    return orderedRanks;
}

const processPageRank = async (pageLink: string) => {
    try {
        const orientedGraph = await getOrientedGraphObject(pageLink);
        const graphNodes = getGraphNodes(orientedGraph);

        let pageRanks = [];
        createPageRank(graphNodes, LINK_PROB, TOLERANCE, (res) => {
            pageRanks = res;
            console.log('In create Page Rank callback');
        }, true);

        const firstTenPageRanks = getFirstTen(pageRanks, orientedGraph);
        console.log('AfterFirstTen');
        const response = {
            data: orientedGraph,
            pageRanks: firstTenPageRanks
        }
        return response
    } catch (err) {
        console.error('Something went wrong\n' + err.toString());
        process.exit(1);
    }
}

const main = async () => {
    const link: string = process.argv[2];
    if (!link) {
       console.error('Please input a string as a first param!\nExample: node index.js string');
       process.exit(1);
    }
    const result = await processPageRank(link);
    console.log('RESULT: \n')
    console.dir(result, {
        depth: 4,
        colors: true,
    })
    process.exit(0);
}

main()
