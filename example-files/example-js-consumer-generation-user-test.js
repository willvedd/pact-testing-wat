import "isomorphic-fetch";
import { PAID_SEARCH_API_KEY } from "@connect/config/environment";
import path from "path";
import { Pact, Matchers } from "@pact-foundation/pact";

const { like, term } = Matchers;
const MOCK_SERVER_PORT = 8765;

const CONSUMER = "connect-api";
const PROVIDER = "sims-paid-search";

jest.mock("@connect/config/environment", () => ({
  PAID_SEARCH_API_KEY: "PAID_SEARCH_API_KEY",
  PAID_SEARCH_URL: `http://localhost:8765`
}));

const globalConfigExpectation = {
  code: 200,
  message: "",
  data: {
    configuration: {
      configuration_id: like(1),
      search_url: like("http://www.site.com/search?q=<SEARCH_TERM>"),
      space_replace: term({ generate: "%20", matcher: "^(\\+|%20)$" }),
      site_url: like("http://site.com"),
      site_name: like("Site Name")
    }
  }
};

describe("data-sources/paid-search/pact-test", () => {
  const provider = new Pact({
    consumer: CONSUMER,
    provider: PROVIDER,
    port: MOCK_SERVER_PORT,
    log: path.resolve(process.cwd(), "mockserver-integration.log"),
    dir: path.resolve(process.cwd(), "pacts"),
    spec: 2,
    logLevel: "WARN",
    cors: true
  });
  const PaidSearch = require("../paid-search.js");
  const paidSearch = new PaidSearch.PaidSearchDataSource();
  paidSearch.initialize({
    context: {},
    cache: { get: () => {}, set: () => {} }
  });

  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());
  afterEach(() => provider.verify());

  describe("when a call get the global config for a site in paid search is made", () => {
    describe("and there is an existing global config", () => {
      const SITE_ID = -500; //Matches what existsin in CI
      beforeAll(() => {
        provider.addInteraction({
          state: "Has a global config",
          uponReceiving: "a request for the site's global config",
          withRequest: {
            method: "GET",
            path: `/adwords/${SITE_ID}/config/global`,
            headers: {
              Accept: "*/*",
              "Api-Token": PAID_SEARCH_API_KEY
            }
          },
          willRespondWith: {
            status: 200,
            headers: {
              "Content-Type": "application/json"
            },
            body: globalConfigExpectation
          }
        });
      });

      it("returns a global config", async () => {
        const globalConfig = await paidSearch.getGlobalConfig({
          siteId: SITE_ID
        });

        expect(globalConfig).toMatchObject({
          configurationId: expect.any(Number),
          searchUrl: expect.stringContaining("<SEARCH_TERM>"),
          spaceReplace: expect.stringMatching("^(\\+|%20)$"),
          siteUrl: expect.stringContaining("http"),
          siteName: expect.any(String)
        });
      });
    });
    describe("and there is not an existing global config", () => {
      const SITE_ID = -200;
      beforeAll(() => {
        provider.addInteraction({
          state: "does not have a global config",
          uponReceiving: "a request for the site's global config",
          withRequest: {
            method: "GET",
            path: `/adwords/${SITE_ID}/config/global`,
            headers: {
              Accept: "*/*",
              "Api-Token": PAID_SEARCH_API_KEY
            }
          },
          willRespondWith: {
            status: 200,
            headers: {
              "Content-Type": "application/json"
            },
            body: {
              code: 200,
              message: "",
              data: {}
            }
          }
        });
      });

      it("returns a global config", async () => {
        const globalConfig = await paidSearch.getGlobalConfig({
          siteId: SITE_ID
        });

        expect(globalConfig).toMatchObject({});
      });
    });
  });
});
