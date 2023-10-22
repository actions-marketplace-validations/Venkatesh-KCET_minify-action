# Minify and Deploy to CloudFront

![GitHub Action Version](https://img.shields.io/badge/dynamic/json?color=blue&label=GitHub%20Action%20Version&query=version&url=https%3A%2F%2Fapi.github.com%2Frepos%2FVenkatesh-KCET%2Fminify-action%2Freleases%2Flatest)

Minify and deploy your web application files to AWS CloudFront with ease using this GitHub Action. This action automates the process of minifying HTML, CSS, and JavaScript files, and then deploys them to an AWS S3 bucket. After deployment, it automatically invalidates the specified paths in your AWS CloudFront distribution to ensure rapid content delivery to your users.

## Usage

### Workflow Configuration

To use this GitHub Action, add a workflow configuration file (e.g., `.github/workflows/minify_and_deploy.yml`) to your repository. Here's an example:

```yaml
name: Minify and Deploy to CloudFront

on:
  push:
    branches:
      - ${{ github.event.inputs.branch || 'main' }}

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout repository
      uses: actions/checkout@v2

    - name: Set up Node.js
      uses: actions/setup-node@v2
      with:
        node-version: 14

    - name: Install project dependencies
      run: npm install

    - name: Install additional dependencies
      run: |
        npm install fs-extra html-minifier uglify-js csso

    - name: Run Minify script
      run: node minify.js

    - uses: actions/checkout@master

    - name: Sync to AWS S3
      uses: jakejarvis/s3-sync-action@master
      with:
        args: --delete
      env:
        AWS_S3_BUCKET: ${{ github.event.inputs.aws_s3_bucket }}
        AWS_ACCESS_KEY_ID: ${{ github.event.inputs.aws_access_key_id }}
        AWS_SECRET_ACCESS_KEY: ${{ github.event.inputs.aws_secret_access_key }}
        AWS_REGION: ${{ github.event.inputs.aws_region || 'us-east-1' }}
        SOURCE_DIR: 'minify'      # optional: defaults to entire repository

    - name: Invalidate CloudFront
      uses: chetan/invalidate-cloudfront-action@v2
      with:
        DISTRIBUTION: ${{ github.event.inputs.cloudfront_distribution }}
        PATHS: ${{ github.event.inputs.paths || "/*" }}
        AWS_REGION: ${{ github.event.inputs.aws_region || 'us-east-1' }}
        AWS_ACCESS_KEY_ID: ${{ github.event.inputs.aws_access_key_id }}
        AWS_SECRET_ACCESS_KEY: ${{ github.event.inputs.aws_secret_access_key }}
```

You can customize the branch that triggers the workflow by modifying the `on.push.branches` section in the workflow file.

### Inputs

This action accepts the following inputs:

- `aws_s3_bucket` (required): The AWS S3 bucket where minified files will be deployed.
- `aws_access_key_id` (required): Your AWS access key ID.
- `aws_secret_access_key` (required): Your AWS secret access key.
- `aws_region` (optional): The AWS region to use (default: 'us-east-1').
- `cloudfront_distribution` (required): Your AWS CloudFront distribution ID.
- `paths` (optional): Paths to invalidate in CloudFront (default: '/*').

### Example Workflow

Here's an example of triggering the workflow with user-defined input parameters:

```yaml
workflow_dispatch:
  inputs:
    aws_s3_bucket: 'your-s3-bucket'
    aws_access_key_id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws_secret_access_key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws_region: 'us-west-2'
    cloudfront_distribution: ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID_PROD }}
    paths: '/assets/*'
```

### Customization

You can customize the minification process by modifying the `minify.js` file in your repository to meet your specific requirements for HTML, CSS, and JavaScript minification.

## License

This GitHub Action is available under the [MIT License](LICENSE).

## Support

For support or questions, please [create an issue](https://github.com/Venkatesh-KCET/minify-action/issues).