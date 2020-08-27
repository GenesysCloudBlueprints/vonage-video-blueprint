# Deployment Guide for Vonage Video on Genesys Cloud
This Genesys Blueprint provides instructions for deploying Vonage Video on Genesys Cloud. The Vonage Video API (formerly TokBox OpenTok) makes it easy to embed high-quality interactive video, voice, messaging, and screen sharing into web and mobile apps. For more info on how the video platform works, check out [Video API Basics](https://tokbox.com/developer/guides/basics/).

Genesys Cloud uses **a standalone integration / the Interaction Widget *(beta)*** to provide customers with a Vonage Video interaction.

### Solution components
* **Genesys Cloud** - The Genesys cloud-based contact center platform. Genesys Cloud is the platform for the Vonage Video solution.
* **Genesys AppFoundry** - The Genesys AppFoundry is an app marketplace for solutions that run on the Genesys Cloud platform. You get the Vonage Video integration used in the solution from the Genesys AppFoundry.
* **Vonage** - Vonage is a telecommunications service provider based on voice over Internet Protocol (VoIP).
* **Vonage Video API platform** - This platform makes it easy to embed real-time high quality interactive video, messaging, screen-sharing and more into web ang mobile applicaitons. The platform includews client libraries for web, iOS, Andriod and Windows as well as server-side SDKs and REST API. The Vonage Video API uses WebRTC for audio-video communications.

### Sample Application Features
* **Interaction Widget ***(beta)*** / Standalone Integration** - Uses the Genesys Cloud's Interaction Widget *(beta)* or a standalone integration widget to enable the agent to start a Vonage room inside Genesys Cloud.
* **Start Vonage rooms** - Allows an agent to start a Vonage room from Genesys Cloud.
* **Send Vonage Invite** - Sends the invite or room link to a customer via Chat, SMS or email.
* **Multiple Interaction Support** - Supports multiple interactions from different interaction channels in Genesys Cloud.
* **Screen Share** - Utilizes the screen share functionality of the Vonage Video API to allow the agent and/or the customer to share their screen.
* **Save Session ID** - Adds a note in the Genesys Cloud interaction detail to save the Vonage Video's session ID.

### Software Development Kit (SDK)
* **Genesys Cloud Platfrom API SDK** - This SDK is used for the initial interaction of agent and customer over chat, SMS and email channels.
* **Vonage Video API SDK** - This SDK is used to createand start a Vonage Video room for the agent and customer to have a video interaction with screen sharing.

# Requirements

## Specialized knowledge
Implementing this solution requires experience in several areas or a willingness to learn:
* Administrator-level knowledge of Genesys Cloud and the Genesys AppFoundry
* Genesys Cloud Platform API knowledge
* Vonage Video API knowledge

## Genesys Cloud account requirements
This solution requires a Genesys Cloud license. For more information on licensing, see [Genesys Cloud Pricing](https://www.genesys.com/pricing "Opens the pricing article").

A recommended Genesys Cloud role for the solutions engineer is Master Admin. For more information on Genesys Cloud roles and permissions, see the [Roles and permissions overview](https://help.mypurecloud.com/?p=24360 "Opens the Roles and permissions overview article").

## Vonage account requirements
This solution requires a Vonage Video license. To sign up for a Vonage Video account, see [here](https://tokbox.com/account/user/signup?icid=tryitfree_comm-apis_tokboxfreetrialsignup_nav).

The solutions engineer requires a Vonage Video account to create a project and generate a Project API Key and Project Secret

# Deployment Steps

# Usage

# Testing

# (Deployment)

# Troubleshooting

# Additional Resources
* [Genesys Cloud Developer Center](https://developer.mypurecloud.com/)
* [Genesys Cloud Platform Client SDK](https://developer.mypurecloud.com/api/rest/client-libraries/)
* [Vonage Developer Center](https://www.vonage.com.ph/developer-center/?icmp=mainnav_developercenter_novalue)
* [Vonage Video Client SDK](https://tokbox.com/developer/sdks/js/)
* [Vonage Video Server SDK](https://tokbox.com/developer/sdks/server/)
