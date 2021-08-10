# EnOcean-Core
EnOcean-Core is a [TypeScript](https://www.typescriptlang.org/) implementation of (some of) the core functionality of the [EnOcean](https://www.enocean.com/) protocol for [Node.js](https://nodejs.org/). This library can be used with a [TCM310 transceiver module](https://www.enocean.com/en/products/enocean_modules/tcm-310/) to implement a basic EnOcean gateway. Currently the implemented features are:
- sending and receiving of ERP1 telegrams,
- manual teach-in and automatic learning mode (UTE, 4BS), and
- automatic interpretation of EEP data of known devices (requires available EEP Parser).


## Table of Contents
1. [Description](#1-description)
    1. [Architecture](#11-architecture)
    1. [Hardware requirements](#12-hardware-requirements)
    1. [EnOcean Equipment Profiles (EEPs)](#13-enocean-equipment-profiles-eeps)
    1. [A note on current features](#14-a-note-on-current-features)
    1. [Why another EnOcean library?](#15-why-another-enocean-library)
1. [Installation](#2-installation)
1. [Usage](#3-usage)
1. [Contributing](#4-contributing)
1. [Version History](#5-version-history)
1. [License](#6-license)
1. [Other legal notes](#7-other-legal-notes)


## 1. Description 
This library provides a high-level interface (API) to communicate with EnOcean devices in [Node.js](https://nodejs.org/). The EnOcean functionality is encapsulated in such a way that it is easy to use, without having to dig into all the technical details of the underlying EnOcean Serial Protocol. Nevertheless, a basic understanding of EnOcean concepts like
- device addressing, 
- equipment profiles (EEP), and
- teach-in procedures

is required to use this library.

The library is developed as part of the author's efforts to build a modern, open source home automation system (not yet released publicly). Hence the library's architecture is (of course) built with this application in mind.

### 1.2 Hardware requirements
While most of this library's data structures are hardware-independent, actual communication with physical EnOcean devices has only been tested with a [TCM310 transceiver module](https://www.enocean.com/en/products/enocean_modules/tcm-310/). To the author's knowledge, this module is currently commercially available in two formats, namely
- in form of a USB stick as [USB 300](https://www.enocean.com/en/products/enocean_modules/usb-300-oem/), or 
- in form of a RaspberryPi hat as [EnOcean Pi module](https://www.enocean.com/fileadmin/redaktion/pdf/white_paper/wp_Raspberry_talks_EnOcean.pdf). 

This library has been tested with both variants. 

### 1.3 EnOcean Equipment Profiles (EEPs)
As the name of this library suggests, it only implements core functionality of the EnOcean protocol. In order to actually communicate with devices, it is necessary to separately implement the corresponding EnOcean Equipment Profile (EEP).

Currently, parsers for the following EEPs are available (as separate libraries, to be published soon). It is also possible to implement own parsers.

- A5-07-03: Occupancy with supply voltage monitor and 10-bit illumination measurement
- D2-01-0F: Electronic switches and dimmers with energy measurement and local control, type 0x0F
- D2-05-00: Blinds control for position and angle, type 0x00
- F6-02-01: Light and blind control - application style 1

### 1.4 A note on current features
Internally, communication with the TCM310 and with other EnOcean devices uses the [EnOcean Serial Protocol 3](https://www.enocean.com/fileadmin/redaktion/pdf/tec_docs/EnOceanSerialProtocol3.pdf) (ESP3). Note that 
- the TCM310 chip's support of the EnOcean Serial Protocol 3 is [limited](https://www.enocean.com/de/produkte/enocean_module/tcm-310/user-manual-pdf/), and also
- this implementation is still work-in-progress, hence many features of ESP3 (even though supported by TCM310) are not yet available.

If you are missing a feature, feel free to submit a feature request. Alternatively, you can also [contribute](##Contributing).

### 1.5 Why another EnOcean library?
If you [search for the term "enocean" on npmjs.com](https://www.npmjs.com/search?q=enocean), you will find many packages implementing the EnOcean protocol for Node.js. However, when the author of this library started working on implementing EnOcean functionality in his home automation software in 2020, he identified two major drawbacks:

- lack of thorough documentation and
- lack of TypeScript support.

While this may have changed by now (and might of course also have been just a personal impression at that time), the author decided that the best solution for his problem (i.e. his own home automation software) was to implement this library from scratch using the official EnOcean documentation.

## 2. Installation
This library is available as a Node.js-module. You can thus use Node.js' package manager `npm` to install the latest production version from the [npm registry](https://npmjs.com) by executing

    npm i enocean-core

in your Node.js project's repository. This will automatically also install the following dependencies.

Name | Description | License
---|---|---
[Node SerialPort](https://serialport.io/) | Node.js package to access serial ports for Linux, OSX and Windows. | MIT
[Node SerialPort's InterByteTimeoutParser](https://serialport.io/docs/api-parser-inter-byte-timeout/) | Parser for Node SerialPort; emits data if there is a pause between packets  | MIT
[Byte](https://henningkerstan.github.io/byte) | A class for simple bit manipulation. | Apache-2.0

## 3. Usage
Since this framework is written in TypeScript, you can use it both with TypeScript as well as with plain JavaScript. Below you can find short examples to get you started in both languages. 

The library also comes with an online [documentation](docs/index.html). A good starting point for further reading is the documentation of the Gateway class. Moreover, as this documentation is generated from source code comments using [TypeDoc](https://typedoc.org), a supported editor (like [Visual Studio Code](https://code.visualstudio.com/)) can provide on-the-fly information on functions, parameters, etc..

### 3.1 Importing the module and connecting a gateway (prerequisite for all following examples)
To use any of the functionality we need to import the module. Moreover, for actual sending/receiving, we need to create a gateway and connect it to a serial port (with a supported transceiver attached, see [above](#12-hardware-requirements) for the supported hardware).
```typescript
import * as EnOcean from "enocean-core"
const gateway = EnOcean.Gateway.connectToSerialPort('COM3')
```
Make sure to replace `COM3` with a valid address/path for your hardware. Note that `COM3` is a Windows address, on Linux with a EnOcean Pi hat, the address could be e.g. `/dev/ttyAMA0`.

### 3.2 Receiving telegrams
Once we have imported the module and instantiated a gateway, we can use it to listen for all incoming ERP1 telegrams.
```typescript
gateway.onReceivedERP1Telegram((telegram) => {
    console.log(telegram.toString())
})
```

### 3.3 Teaching/learning devices
The gateway will automatically interpret any received data as far as possible. Due to the EnOcean protocol, a necessary prerequisite for this is that the gateway knows the EEP of the sending device. There are two possible options to achieve this.

#### 3.3.1 Manual teach-in of devices
To listen and interpret messages, it is sufficient to simply tell the gateway the EEP of a device. Suppose we have a simple rocker switch with ID '12:34:56:78' sending data according to EEP 'F6-D2-01' then we can manually teach the gateway using the following code.
```typescript
gateway.teachDevice(
    DeviceId.fromString('12:34:56:78'),
    EEPId.fromString('F6-D2-01'),
)
```
Now, each button push on the button will be automatically interpreted as described [below](#34-receiving-and-interpreting-eep-data-after-successful-teach-in). 

#### 3.3.2 Automatic teach-in (learning) of devices (UTE, 4BS, RPS)
While for simple EnOcean sensors (like the above rocker switch) only the gateway needs to know the sensor, more sophisticated devices (in particular actuators) require a mutual teach-in. The usual procedure consists of two steps:

1. Set the gateway in learning mode. This can be done with the following code.
```typescript
gateway.startLearning(120)
```
Here, the learning mode will be active for 120 seconds.

2. Trigger the teach-in/learning process on the actuator.

If the gateway is able to successfully learn the new device, it will emit an event. Thus to get notified of a successful teach-in, we can register a listener as follows. 
```typescript
gateway.onDeviceTeachIn((device, info) => {
    console.log('Teach-in sucessfully completed for device ' + device.toString())
})
```
The listener will also be called on manual teach-ins (see above). Currently the gateway only supports the following teach-in procedures:
- fully automatic universal teach-in (UTE),
- fully automatic 4BS teach-in, and
- semi-automatic RPS teach-in (devices will be added to list of known devices but EEP needs to be added manually afterwards).
For the RPS teach-in, no further simplification is possible as RPS devices do not provide their EEPs.

#### 3.4 Receiving and interpreting EEP data after successful teach-in
After a successful teach-in (either manually or automatically), the gateway will try to automatically interpret all incoming messages from these known devices. We can listen to all successfully interpreted message as follows.
```typescript
gateway.onReceivedEEPMessage((message, telegram) => {
    console.log(message)
})
```
Note in the example that the listener can also access the telegram in which the message was enclosed. Besides knowing the device and its EEP, a necessity for successful interpretation is the existence of a so called 'EEP parser' for the respective EEP. See above for a [list of supported EEPs](#14-supported-eeps), i.e. for EEPs for which a parser is available. 

### 3.5 Sending telegrams
Sending raw ERP1 telegrams is simple.
```typescript
const result = await this.sendERP1Telegram(telegram)
```
If the returned value is 0, sending succeed. Otherwise the returned number will give the reason why sending failed.



## 4. Contributing
Contact the main author ([Henning Kerstan](https://henningkerstan.de)) if you want to contribute. More details will be available here soon.

This project uses [semantic versioning](https://semver.org/). However, despite most of the API being ready, note that since we are still in development (version 0.x.y), anything may yet change at any time. 

For detailed information on the (minimal) required versions, have a look at the [package.json](../package.json).

## 5. Version history
As this library has not yet fully matured (version is still < 1.0.0), this is merely a brief version history. A more detailed version history will be available starting with the release of version 1.0.0.

- v0.8.1 is the first version published on npmjs (v0.8.0 still had a private flag in its package.json)
- v0.8.0 is the first public version (all prior development took place in a private repository).

## 6. License
Copyright 2021 [Henning Kerstan](https://henningkerstan.de)

SPDX-License-Identifier: Apache-2.0


## 7. Other legal notes
EnOcean® and the EnOcean logo are registered trademarks of [EnOcean GmbH](https://www.enocean.com). All other product or service names are the property of their respective owners.