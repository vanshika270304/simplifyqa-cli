# SimplifyQA CLI Tool Documentation
This document provides detailed information about the commands, their shorthand, and longhand notations, along with their respective arguments.

1. Login Command
    - Shorthand: `sqa l`
    - Longhand: `sqa login`

    Arguments:
    - `-u`, `--username` <username>: Specifies the username of the user.
    - `-p`, `--password` <password>: Specifies the password of the user.

2. Register Device Command
    - Shorthand: `cli rd`
    - Longhand: `cli register-device`

    Arguments:
    - `-i`, `--ip` <IP_address>: Specifies the IP address of the remote device.
    - `-m`, `--mac` <MAC_address>: Specifies the MAC address of the remote device.

3. Execute Command
    - Shorthand: `cli e`
    - Longhand: `cli execute`

    Arguments:
    - `-x`, `--token` <execution_token>: Specifies the execution token for secure execution.
    - `-a`, `--app-url` <app_url>: Specifies the URL of the SimplifyQA instance where the application is hosted.
    - `-t`, `--threshold` <threshold_percentage>: Specifies the threshold percentage for execution (0 to 100).
    - `-v`, `--verbose`: Flag to enable verbose mode (true/false).


This documentation provides a clear overview of each command, their shorthand and longhand notations, and the corresponding arguments. Use this guide as a reference while using the CLI tool to perform various tasks.
