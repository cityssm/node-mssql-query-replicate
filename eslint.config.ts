import eslintConfigCityssm, {
  type Config,
  tseslint
} from 'eslint-config-cityssm'

const config = tseslint.config(...eslintConfigCityssm, {
  rules: {
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off'
  }
}) as Config

export default config
