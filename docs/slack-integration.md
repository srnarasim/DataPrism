# Slack Integration for DataPrism CI/CD

This guide explains how to set up Slack notifications for DataPrism's CI/CD pipeline to receive build status updates in your Slack workspace.

## Overview

The DataPrism CI/CD pipeline sends notifications to different Slack channels based on build events:

- **#dataprism-builds** - General build status notifications (success, failure, cancelled)
- **#dataprism-alerts** - Critical failure alerts requiring immediate attention
- **#dataprism-deployments** - Production deployment success notifications
- **#dataprism-releases** - New release announcements

## Slack Workspace Setup

### 1. Create Slack Channels

In your **dataprism-group.slack.com** workspace, create the following channels:

```
#dataprism-builds      - General CI/CD notifications
#dataprism-alerts      - Critical failure alerts
#dataprism-deployments - Production deployment updates  
#dataprism-releases    - Release announcements
```

### 2. Create Slack App

1. Go to [Slack API](https://api.slack.com/apps)
2. Click **"Create New App"**
3. Choose **"From scratch"**
4. App Name: `DataPrism CI/CD`
5. Workspace: `dataprism-group.slack.com`
6. Click **"Create App"**

### 3. Configure Incoming Webhooks

1. In your app dashboard, click **"Incoming Webhooks"**
2. Toggle **"Activate Incoming Webhooks"** to **On**
3. Click **"Add New Webhook to Workspace"**
4. Select the channel **#dataprism-builds**
5. Click **"Allow"**
6. Copy the webhook URL (it will look like: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX`)

### 4. Configure GitHub Secret

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `SLACK_WEBHOOK_URL`
5. Secret: Paste the webhook URL from step 3
6. Click **"Add secret"**

## Notification Types

### Build Status Notifications

**Channel:** `#dataprism-builds`

Sent for all builds on `main` and `develop` branches with:
- ✅ Build success status with job results
- 🚨 Build failure summary
- ⚠️ Build cancellation alerts

**Example Success Message:**
```
✅ Build Successful
Repository: dataprism/core
Branch: main
Commit: a1b2c3d
Author: developer

Job Results:
• Security: success
• Lint: success  
• Tests: success
• Build: success
• Browser Tests: success
• CDN Deployment: success
• CDN Validation: success

View workflow run
```

### Critical Failure Alerts

**Channel:** `#dataprism-alerts`

Sent only for build failures requiring immediate attention:
- Detailed failure breakdown by job
- Required actions to resolve
- Deployment impact assessment

**Example Failure Message:**
```
🔥 Critical Build Failure - Immediate Attention Required
🚨 CRITICAL: Build failure on main branch

Repository: dataprism/core
Commit: a1b2c3d
Author: developer
Triggered by: push

Failed Jobs:
❌ Tests failed
❌ Build failed

Actions Required:
1. Review the workflow logs
2. Fix the identified issues
3. Push a fix or revert the problematic commit

Deployment Status:
• Production deployment is blocked
• CDN updates failed
```

### Deployment Success Notifications  

**Channel:** `#dataprism-deployments`

Sent only for successful production deployments on `main` branch:
- Deployment status breakdown
- Live URL links
- Performance metrics

**Example Deployment Message:**
```
🚀 Production Deployment Successful
✅ Production deployment completed successfully!

Repository: dataprism/core
Branch: main
Commit: a1b2c3d
Author: developer

Deployment Details:
• CDN: ✅ Deployed
• Demo App: ✅ Deployed
• Documentation: ✅ Updated

Live URLs:
• CDN Assets
• Demo Application  
• Documentation

Performance Metrics:
• Build time: ~15 minutes
• Tests passed: All integration and browser tests
• Bundle size: Optimized and within limits
```

### Release Notifications

**Channel:** `#dataprism-releases`

Sent when commits contain `[release]` in the message:
- Version information
- Release notes link
- Installation instructions

**Example Release Message:**
```
📦 New Release Available
🎉 New DataPrism release is now available!

Release Details:
• Version: v1.2.0
• Repository: dataprism/core
• Commit: a1b2c3d
• Author: developer

What's New:
Check the release notes for detailed changelog.

Availability:
• NPM Registry
• CDN (Latest)
• Live Demo

Installation:
npm install @dataprism/core@latest
```

## Testing the Integration

### 1. Verify Webhook Connection

Test your webhook URL:

```bash
curl -X POST -H 'Content-type: application/json' \
--data '{"text":"Hello from DataPrism CI/CD setup test!"}' \
YOUR_WEBHOOK_URL
```

### 2. Trigger Build Notifications

1. **Success Notification**: Push any change to `main` branch
2. **Failure Notification**: Push code with failing tests to `main` branch  
3. **Release Notification**: Push commit with `[release]` in message
4. **Deployment Notification**: Successful build and deployment on `main`

### 3. Check Channel Activity

After triggering builds, verify notifications appear in:
- `#dataprism-builds` for general status
- `#dataprism-alerts` for failures  
- `#dataprism-deployments` for successful deployments
- `#dataprism-releases` for releases

## Customization

### Adding More Channels

To add notifications to additional channels:

1. Create new webhook for the channel in Slack
2. Add the webhook URL as a new GitHub secret
3. Modify `.github/workflows/ci.yml` to use the new webhook

### Customizing Messages

Edit the `text:` sections in `.github/workflows/ci.yml` to customize:
- Message format and content
- Emoji usage
- Included information
- Action buttons and links

### Filtering Notifications

Modify the `if:` conditions in the workflow to:
- Send notifications for specific branches only
- Filter by commit author
- Include/exclude specific job results
- Set up different rules for different environments

## Troubleshooting

### Notifications Not Appearing

1. **Check GitHub Secrets**: Verify `SLACK_WEBHOOK_URL` is set correctly
2. **Verify Webhook URL**: Test the webhook URL manually
3. **Check Channel Permissions**: Ensure the app has permission to post
4. **Review Workflow Logs**: Check GitHub Actions logs for Slack errors

### Webhook URL Issues

If webhook URL doesn't work:
1. Regenerate the webhook in Slack
2. Update the GitHub secret with new URL
3. Verify the app has `chat:write` scope

### Missing Notifications

Check the workflow conditions:
- Notifications only trigger on `main` and `develop` branches
- Release notifications require `[release]` in commit message
- Deployment notifications only for successful `main` builds

### Too Many Notifications

To reduce notification frequency:
1. Modify branch filters in workflow conditions
2. Add author filters to exclude bot commits
3. Increase failure thresholds before alerting

## Security Considerations

- **Webhook URLs**: Keep webhook URLs secret - they provide write access to your Slack
- **Channel Access**: Ensure only authorized team members can see sensitive channels
- **App Permissions**: Grant minimal required permissions to the Slack app
- **Rotation**: Regularly rotate webhook URLs for security

## Advanced Configuration

### Custom App Icon and Name

In your Slack app settings:
1. Go to **"Display Information"**  
2. Upload DataPrism logo as app icon
3. Set app name to "DataPrism CI/CD"
4. Add description: "Automated notifications for DataPrism builds and deployments"

### Message Threading

To organize notifications in threads, modify the workflow to include:
```yaml
thread_ts: ${{ github.run_id }}
```

### Rich Message Formatting

Enhance messages with:
- Block kit layouts
- Interactive buttons
- Attachment fields
- Color coding by severity

### Integration with Other Services

Extend notifications to:
- Microsoft Teams
- Discord  
- Email alerts
- PagerDuty for critical failures
- Jira for automatic issue creation

## Support

For issues with Slack integration:
1. Check [GitHub Actions logs](https://github.com/dataprism/core/actions) for error details
2. Verify Slack app configuration in your workspace
3. Test webhook URLs manually
4. Create an issue in the DataPrism repository with integration logs

The integration uses the `8398a7/action-slack@v3` GitHub Action. For action-specific issues, refer to the [action documentation](https://github.com/8398a7/action-slack).