// @generated — do not edit. Run 'pnpm gen:schema' to regenerate.

/**
 * A superset of JSON Resume (https://jsonresume.org). Any valid JSON Resume document is a valid HumbleHire resume. HumbleHire adds basics.highlights (bullet-point list alongside the standard summary string), work[].keywords (per-role skills), and meta.humblehire (schema version + lossless contacts round-trip). The JSON Resume base schema is inlined under definitions/jsonResume for reproducibility — this document has no external dependencies.
 */
export type CvDocument = JsonResume & {
  basics?: {
    /**
     * Key highlights as a list of bullet points. HumbleHire-native alternative to the summary string — human-editable, LLM-friendly. Use instead of or alongside summary. Absent from the JSON Resume export, where highlights are joined into summary.
     */
    highlights?: string[];
  };
  work?: {
    /**
     * Technologies and skills used in this role. HumbleHire extension; absent from JSON Resume export.
     */
    keywords?: string[];
  }[];
  meta?: {
    /**
     * HumbleHire-specific metadata. Ignored by standard JSON Resume tooling. Present only in HumbleHire JSON exports.
     */
    humblehire?: {
      /**
       * HumbleHire schema version of this document, e.g. "0.0.1". Importers refuse files with a version higher than they support.
       */
      schemaVersion: string;
      /**
       * Exact contact entries for lossless round-trip. Takes precedence over basics.email/phone/url/profiles on import.
       */
      contacts?: {
        /**
         * Human-readable label, e.g. "Email", "LinkedIn", "GitHub".
         */
        label: string;
        /**
         * The contact value, e.g. an email address or URL.
         */
        value: string;
      }[];
    };
  };
};
/**
 * Similar to the standard date type, but each section after the year is optional. e.g. 2014-06-29 or 2023-04
 */
export type Iso8601 = string;

/**
 * JSON Resume schema (https://jsonresume.org), vendored at the version current when HumbleHire schema v0.0.1 was published. All fields are optional; additionalProperties is true throughout so HumbleHire extensions pass JSON Resume validators unchanged.
 */
export interface JsonResume {
  /**
   * Link to the version of the schema that can validate the resume.
   */
  $schema?: string;
  basics?: {
    /**
     * Full name.
     */
    name?: string;
    /**
     * Job title, e.g. Web Developer.
     */
    label?: string;
    /**
     * URL (as per RFC 3986) to a image in JPEG or PNG format.
     */
    image?: string;
    /**
     * e.g. thomas@gmail.com
     */
    email?: string;
    /**
     * Phone numbers are stored as strings so use any format you like, e.g. 712-117-2923.
     */
    phone?: string;
    /**
     * URL (as per RFC 3986) to your website, e.g. personal homepage.
     */
    url?: string;
    /**
     * Write a short 2-3 sentence biography about yourself.
     */
    summary?: string;
    location?: {
      /**
       * To add multiple address lines, use \n. For example, 1234 Glücklichkeit Straße\nHinterhaus 5. Etage li.
       */
      address?: string;
      postalCode?: string;
      city?: string;
      /**
       * Code as per ISO-3166-1 ALPHA-2, e.g. US, AU, IN.
       */
      countryCode?: string;
      /**
       * The general region where you live. Can be a US state, or a province, for instance.
       */
      region?: string;
      [k: string]: unknown;
    };
    /**
     * Specify any number of social networks that you participate in.
     */
    profiles?: {
      /**
       * e.g. Facebook or Twitter.
       */
      network?: string;
      /**
       * e.g. neutralthoughts.
       */
      username?: string;
      /**
       * e.g. http://twitter.example.com/neutralthoughts.
       */
      url?: string;
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  };
  work?: {
    /**
     * Employer name, e.g. Facebook.
     */
    name?: string;
    /**
     * e.g. Menlo Park, CA.
     */
    location?: string;
    /**
     * e.g. Social Media Company.
     */
    description?: string;
    /**
     * e.g. Software Engineer.
     */
    position?: string;
    /**
     * e.g. http://facebook.example.com
     */
    url?: string;
    startDate?: Iso8601;
    endDate?: Iso8601;
    /**
     * Give an overview of your responsibilities at the company.
     */
    summary?: string;
    /**
     * Specify multiple accomplishments.
     */
    highlights?: string[];
    [k: string]: unknown;
  }[];
  volunteer?: {
    /**
     * e.g. Facebook.
     */
    organization?: string;
    /**
     * e.g. Software Engineer.
     */
    position?: string;
    /**
     * e.g. http://facebook.example.com
     */
    url?: string;
    startDate?: Iso8601;
    endDate?: Iso8601;
    /**
     * Give an overview of your responsibilities at the company.
     */
    summary?: string;
    /**
     * Specify accomplishments and achievements.
     */
    highlights?: string[];
    [k: string]: unknown;
  }[];
  education?: {
    /**
     * e.g. Massachusetts Institute of Technology.
     */
    institution?: string;
    /**
     * e.g. https://mit.edu
     */
    url?: string;
    /**
     * e.g. Arts.
     */
    area?: string;
    /**
     * e.g. Bachelor.
     */
    studyType?: string;
    startDate?: Iso8601;
    endDate?: Iso8601;
    /**
     * Grade point average, e.g. 3.67/4.0.
     */
    score?: string;
    /**
     * List notable courses/subjects.
     */
    courses?: string[];
    [k: string]: unknown;
  }[];
  /**
   * Specify any awards you have received throughout your professional career.
   */
  awards?: {
    /**
     * e.g. One of the 100 greatest minds of the century.
     */
    title?: string;
    date?: Iso8601;
    /**
     * e.g. Time Magazine.
     */
    awarder?: string;
    /**
     * e.g. Received for my work with Quantum Physics.
     */
    summary?: string;
    [k: string]: unknown;
  }[];
  /**
   * Specify any certificates you have received throughout your professional career.
   */
  certificates?: {
    /**
     * e.g. Certified Kubernetes Administrator.
     */
    name?: string;
    date?: Iso8601;
    /**
     * e.g. http://example.com
     */
    url?: string;
    /**
     * e.g. CNCF.
     */
    issuer?: string;
    [k: string]: unknown;
  }[];
  /**
   * Specify your publications through your career.
   */
  publications?: {
    /**
     * e.g. The World Wide Web.
     */
    name?: string;
    /**
     * e.g. IEEE, Computer Magazine.
     */
    publisher?: string;
    releaseDate?: Iso8601;
    /**
     * e.g. http://www.computer.org.example.com/csdl/mags/co/1996/10/rx069-abs.html
     */
    url?: string;
    /**
     * Short summary of publication. e.g. Discussion of the World Wide Web, HTTP, HTML.
     */
    summary?: string;
    [k: string]: unknown;
  }[];
  /**
   * List out your professional skill-set.
   */
  skills?: {
    /**
     * e.g. Web Development.
     */
    name?: string;
    /**
     * e.g. Master.
     */
    level?: string;
    /**
     * List some keywords pertaining to this skill.
     */
    keywords?: string[];
    [k: string]: unknown;
  }[];
  /**
   * List any other languages you speak.
   */
  languages?: {
    /**
     * e.g. English, Spanish.
     */
    language?: string;
    /**
     * e.g. Fluent, Beginner.
     */
    fluency?: string;
    [k: string]: unknown;
  }[];
  interests?: {
    /**
     * e.g. Philosophy.
     */
    name?: string;
    keywords?: string[];
    [k: string]: unknown;
  }[];
  /**
   * List references you have received.
   */
  references?: {
    /**
     * e.g. Timothy Cook.
     */
    name?: string;
    /**
     * e.g. Joe blogs was a great employee...
     */
    reference?: string;
    [k: string]: unknown;
  }[];
  /**
   * Specify career projects.
   */
  projects?: {
    /**
     * e.g. The World Wide Web.
     */
    name?: string;
    /**
     * Short summary of project.
     */
    description?: string;
    /**
     * Specify multiple features.
     */
    highlights?: string[];
    /**
     * Specify special elements involved.
     */
    keywords?: string[];
    startDate?: Iso8601;
    endDate?: Iso8601;
    url?: string;
    /**
     * Specify your role on this project or in company.
     */
    roles?: string[];
    /**
     * Specify the relevant company/entity affiliations e.g. 'greenpeace', 'corporationXYZ'.
     */
    entity?: string;
    /**
     * e.g. 'volunteering', 'presentation', 'talk', 'application', 'conference'.
     */
    type?: string;
    [k: string]: unknown;
  }[];
  /**
   * The schema version and any other tooling configuration lives here.
   */
  meta?: {
    /**
     * URL (as per RFC 3986) to latest version of this document.
     */
    canonical?: string;
    /**
     * A version field which follows semver - e.g. v1.0.0.
     */
    version?: string;
    /**
     * Using ISO 8601 with YYYY-MM-DDThh:mm:ss.
     */
    lastModified?: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
