import eslint from "@eslint/js";
import tsEslint from "typescript-eslint";
import globals from "globals";
// import reactRecommended from "eslint-plugin-react/configs/recommended.js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import eslintConfigPrettier from "eslint-config-prettier";
import { fixupPluginRules } from "@eslint/compat";

export default [
	{
		files: ["**/*.{js,ts,jsx,tsx}"],
	},
	eslint.configs.recommended,
	...tsEslint.configs.recommended,
	// reactRecommended,
	{
		plugins: {
			react,
			'react-hooks': fixupPluginRules(reactHooks),
		},
		// rules: reactHooks.configs.recommended.rules,
		languageOptions: {
			parserOptions: {
				ecmaFeatures: {
					jsx: true
				}
			}
		},
		rules: {
			...react.configs.recommended.rules,
			...reactHooks.configs.recommended.rules,
			"react/react-in-jsx-scope": "off",
		},
		settings: {
			version: "detect",
		},
	},
	eslintConfigPrettier,
    {
        languageOptions: {
            globals: {
                // Allow globals like console to be used without errors
                ...globals.browser
            }
        },
		rules: {
			semi: "warn",
        }
    }
];
