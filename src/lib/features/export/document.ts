/**
 * `{label, value}` contact entry used for lossless round-trip.
 * Will be deprecated and removed in favor of {@link CvDocumentBasics.email}, {@link CvDocumentBasics.phone}, {@link CvDocumentBasics.url}, and	{@link CvDocumentBasics.profiles} in a future version.
 */
export interface CvDocumentContact {
	/** Human-readable label, e.g. `"Email"`, `"LinkedIn"`, `"GitHub"`. */
	label: string;
	/** The contact value: an email address, phone number, or URL. */
	value: string;
}

export interface CvDocumentBasics {
	/** Full name. */
	name?: string;
	/** Professional title, e.g. `"Software Engineer"`. */
	label?: string;
	/**
	 * Short biography.
	 *
	 * HumbleHire JSON export: omitted; `highlights` is used instead.
	 * JSON Resume export: highlights joined with `\n`.
	 * Import: when `highlights` is absent, split by newlines into the highlights list.
	 */
	summary?: string;
	/**
	 * Bullet-point highlights.
	 *
	 * HumbleHire extension; absent from JSON Resume export. Preferred over `summary` on import of JSON Resume documents.
	 */
	highlights?: string[];
	/**
	 * Geographic location.
	 *
	 * Export: free-text location string packed into `address`.
	 * Import from foreign JSON Resume files: `city`, `region`, and `countryCode` joined with `", "` when `address` is absent.
	 */
	location?: {
		/**
		 * Street address or free-text location string.
		 * HumbleHire exports always write this field, so round-trip is exact.
		 */
		address?: string;
		/** Postal or ZIP code. */
		postalCode?: string;
		/** City name. */
		city?: string;
		/** Two-letter ISO 3166-1 country code, e.g. `"US"`. */
		countryCode?: string;
		/** State, province, or region. */
		region?: string;
	};
	/** Contact email. Written from `meta.humblehire.contacts` on HumbleHire export. */
	email?: string;
	/** Phone number. Stored as a string; any format is accepted. */
	phone?: string;
	/** Personal website or homepage URL. */
	url?: string;
	/** Social network profiles. On import, each entry becomes a `{label: network, value: url}` contact. */
	profiles?: Array<{
		/** Social network name, e.g. `"LinkedIn"`, `"GitHub"`. */
		network?: string;
		/** Profile URL. */
		url?: string;
		/** Username or handle on the network. */
		username?: string;
	}>;
}

export interface CvDocumentWorkItem {
	/** Employer name. JSON Resume calls this `name`; the runtime model uses `company`. */
	name?: string;
	/** Job title held at this employer. */
	position?: string;
	/** Start date in `YYYY-MM` format. */
	startDate?: string;
	/** End date in `YYYY-MM` format. Absent means the role is current. */
	endDate?: string;
	/** Accomplishment bullet points. Maps to `achievements[].text` in the runtime model. */
	highlights?: string[];
	/**
	 * Technologies and skills used in this role.
	 *
	 * HumbleHire extension; absent from JSON Resume export. Maps to `skills[].value` in the runtime model.
	 */
	keywords?: string[];
	/** Company website URL. */
	url?: string;
	/** Geographic location of the role. */
	location?: string;
	/** Company type or industry description. */
	description?: string;
	/** Overview of responsibilities at this employer. */
	summary?: string;
}

export interface CvDocumentEducationItem {
	/** Name of the school or university. */
	institution?: string;
	/**
	 * Degree level, e.g. `"Bachelor"`, `"Master"`.
	 *
	 * Written from the runtime model's `degree` field. On import from foreign files,
	 * `area` is appended (space-separated) when both are present.
	 */
	studyType?: string;
	/**
	 * Field of study, e.g. `"Computer Science"`.
	 *
	 * Joined to `studyType` on import when both are present.
	 * HumbleHire exports write `degree` into `studyType` and omit `area`, so round-trip is exact.
	 */
	area?: string;
	/** Start date in `YYYY-MM` format. */
	startDate?: string;
	/** End date in `YYYY-MM` format. Absent means currently enrolled. */
	endDate?: string;
	/** Grade or score, e.g. `"3.67/4.0"`. */
	score?: string;
	/** Institution website URL. */
	url?: string;
	/** Notable courses or subjects. */
	courses?: string[];
}

export interface CvDocumentSkillItem {
	/** Skill category name, e.g. `"Web Development"`. */
	name?: string;
	/** Skills in this category, e.g. `["TypeScript", "React"]`. Maps to `skills[].value` in the runtime model. */
	keywords?: string[];
	/** Proficiency level, e.g. `"Master"`, `"Intermediate"`. */
	level?: string;
}

export interface CvDocumentProjectItem {
	/** Project name. */
	name?: string;
	/** Brief project overview. */
	description?: string;
	/**
	 * Technologies used.
	 *
	 * HumbleHire extension. Maps to `stack[].value` in the runtime model.
	 */
	keywords?: string[];
	/** Project URL. Maps to `link` in the runtime model. */
	url?: string;
	/** Start date in `YYYY-MM` format. */
	startDate?: string;
	/** End date in `YYYY-MM` format. Absent means the project is ongoing. */
	endDate?: string;
	/** Key features or accomplishments. */
	highlights?: string[];
	/** Roles or responsibilities on this project. */
	roles?: string[];
	/** Associated organization or client. */
	entity?: string;
	/** Project category, e.g. `"volunteering"`, `"presentation"`, `"application"`. */
	type?: string;
}

export interface CvDocumentMeta {
	/**
	 * HumbleHire-specific metadata. Standard JSON Resume tooling ignores this object.
	 * Present only in HumbleHire JSON exports.
	 */
	humblehire?: {
		/**
		 * HumbleHire schema version, e.g. `"0.0.1"`.
		 * Documents with a higher version than the app supports are rejected on import.
		 */
		schemaVersion: string;
		/**
		 * Contact list for lossless round-trip.
		 * Overrides `basics.email`, `basics.phone`, `basics.url`, and `basics.profiles` on import.
		 */
		contacts?: CvDocumentContact[];
	};
	/** Canonical URL for this document. */
	canonical?: string;
	/** Document version string. */
	version?: string;
	/** ISO 8601 timestamp of last modification. */
	lastModified?: string;
}

/**
 * Wire format DTO for CV export and import.
 *
 * A JSON Resume superset; HumbleHire adds `basics.highlights`, `work[].keywords`,
 * and `meta.humblehire`. See `static/schema/resume/v0.0.1.json`.
 * Convert to/from the runtime `CV` model via `toDocument` and `fromDocument`.
 */
export interface CvDocument {
	/**
	 * JSON Schema URL.
	 * `.humblehire.json` exports point at the HumbleHire superset schema;
	 * plain `.json` exports point at the standard JSON Resume schema.
	 */
	$schema?: string;
	/** Personal and contact information. */
	basics?: CvDocumentBasics;
	/** Work experience entries. */
	work?: CvDocumentWorkItem[];
	/** Education history entries. */
	education?: CvDocumentEducationItem[];
	/** Skills and competencies. */
	skills?: CvDocumentSkillItem[];
	/** Notable projects. */
	projects?: CvDocumentProjectItem[];
	/** Document metadata. */
	meta?: CvDocumentMeta;
}
