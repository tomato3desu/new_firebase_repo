// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
    // Your custom configs here
    {
        files: ["**/*.vue", "**/*.ts", "**/*.js", "**/*.mjs"],
        rules: {
            "no-console": "off",
            "typescript-eslint/no-explicit-any": "off",
            "@stylistic/quotes": "off",
            "@stylistic/comma-dangle": "off",
            "@stylistic/eol-last": "off",
            "nuxt/nuxt-config-keys-order": "off",
            "@stylistic/arrow-parens": "off",
            "@stylistic/no-trailing-spaces": "off"
        }
    }
)
