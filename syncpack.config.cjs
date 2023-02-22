/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

module.exports = {
	indent: "\t",

	// Don't set dep versions based on the version of the package in the workspace
	workspace: false,

	// Custom types are used to define additional fields in package.json that contain versions that should be
	// checked/synced. See https://jamiemason.github.io/syncpack/config/custom-types for more details.
	customTypes: {
		engines: {
			path: "engines",
			strategy: "versionsByName",
		},
		packageManager: {
			path: "packageManager",
			strategy: "name@version",
		},
	},

	/**
	 * SemverGroups are used to ensure that groups of packages use the same semver range for dependencies.
	 *
	 * semverGroup rules are applied in order to package/dep combinations. First matching rule applies. When running
	 * `syncpack lint-semver-ranges`, the output is grouped into numbered groups.
	 */
	semverGroups: [
		{
      label: "engines.node should always use >= ranges",
			dependencyTypes: ["engines"],
			dependencies: ["node"],
			packages: ["**"],
			range: ">=",
		},

		{
      label: "engines.npm should always use caret ranges",
			dependencyTypes: ["engines"],
			dependencies: ["npm"],
			packages: ["**"],
			range: "^",
		},

		{
      label: "packageManager should always use exact dependency ranges",
			dependencyTypes: ["packageManager"],
			dependencies: ["**"],
			packages: ["**"],
			range: "",
		},

		// PropertyDDS packages' dependencies are ignored because they use a lot of exact deps.
		{
			dependencies: ["**"],
			packages: ["@fluid-experimental/property-*"],
			isIgnored: true,
		},

		{
      label: "Deps in pnpm overrides should use caret dependency ranges",
			dependencyTypes: ["pnpmOverrides"],
			dependencies: ["**"],
			packages: ["**"],
			range: "^",
		},

		{
      label: "Must use exact dependency ranges",
			dependencies: [
				"@tiny-calc/*",
				"@graphql-codegen/cli",
				"@graphql-codegen/typescript",
				"@material-ui/*",
				"@types/chrome",
				"@types/codemirror",
				"@types/expect-puppeteer",
				"@types/jest-environment-puppeteer",
				"@types/jest",
				"@types/puppeteer",
				"@types/url-parse",
				"fake-indexeddb",
				"json-stringify-safe",
				"tinylicious",
				"yargs",
			],
			packages: ["**"],
			range: "",
		},

		// Some dependencies, like typescript and eslint, recommend to use tilde deps because minors introduce
		// changes that may break linting
		{
      label: "Must use tilde dependency ranges",
			dependencies: [
				"eslint-plugin-*",
				"eslint-config-prettier",
				"eslint",
				"less",
				"prettier",
				"typescript",
				"vue",
				"webpack-dev-server",
			],
			packages: ["**"],
			range: "~",
		},

		// All deps should use caret ranges unless previously overridden
		{
      label: "Dependencies should use caret dependency ranges",
			dependencies: ["**"],
			dependencyTypes: ["dev", "peer", "prod"],
			packages: ["**"],
			range: "^",
		},
	],

	/**
	 *  VersionGroups are used to ensure that groups of packages use the same version of dependencies.
	 *
	 * versionGroup rules are applied in order to package/dep combinations. First matching rule applies. When running
	 * `syncpack list-mismatches`, the output is grouped into numbered groups.
	 */
	versionGroups: [
		// All dependencies on these common Fluid packages outside the release group should match
		{
      label: "Versions of common Fluid packages should all match",
			dependencies: [
				"@fluidframework/build-common",
				"@fluidframework/eslint-config-fluid",
				"@fluidframework/build-tools",
				"@fluid-tools/build-cli",
			],
			packages: ["**"],
		},

		// engines.node and engines.npm versions should match
		{
      label: "Versions in engines field should all match",
			dependencyTypes: ["engines"],
			dependencies: ["**"],
			packages: ["**"],
		},

		// Version Group 3
		// packageManager versions should match, though this field is only used in the release group root
		// package.json today.
		{
      label: "Versions in packageManager field should all match",
      dependencyTypes: ["packageManager"],
			dependencies: ["**"],
			packages: ["**"],
		},

		// Ignore interdependencies on other Fluid packages. This is needed because syncpack doesn't understand our
		// >= < semver ranges.
		{
      label: "Ignore interdependencies on other Fluid packages. This is needed because syncpack doesn't understand our >= < semver ranges",
			isIgnored: true,
			packages: [
				"@fluid-example/**",
				"@fluid-experimental/**",
				"@fluid-internal/**",
				"@fluid-tools/**",
				"@fluidframework/**",
				"fluid-framework",
			],
			dependencies: [
				"@fluid-example/**",
				"@fluid-experimental/**",
				"@fluid-internal/**",
				"@fluid-tools/**",
				"@fluidframework/**",
				"fluid-framework",
			],
		},
	],
};
