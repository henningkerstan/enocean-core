// Project: enocean-core
// File: CommonCommandCode.ts
//
// Copyright 2020 Henning Kerstan
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/** @internal
 *
 * List of common command codes (internal use only)
 */
export enum CommonCommandCode {
  /** Enter energy saving mode  */
  CO_WR_SLEEP = 1,

  /** Reset the device */
  CO_WR_RESET = 2,

  /** Read the device version information  */
  CO_RD_VERSION = 3,

  /** Read system log */
  CO_RD_SYS_LOG = 4,

  /** Reset system log */
  CO_WR_SYS_LOG = 5,

  // TODO: Continue documentation!

  /** Perform Self test */
  CO_WR_BIST = 6,

  /** Set ID range base address */
  CO_WR_IDBASE = 7,
  CO_RD_IDBASE = 8, // Read ID range base address
  CO_WR_REPEATER = 9, // Set Repeater Level
  CO_RD_REPEATER = 10, // Read Repeater Level
  CO_WR_FILTER_ADD = 11, // Add filter to filter list
  CO_WR_FILTER_DEL = 12, // Delete a specific filter from filter list
  CO_WR_FILTER_DEL_ALL, // Delete all filters from filter list
  CO_WR_FILTER_ENABLE, // Enable / disable filter list
  CO_RD_FILTER, // Read filters from filter list
  CO_WR_WAIT_MATURITY, // Wait until the end of telegram maturity time before received radio telegrams will be forwarded to the external host

  ///** NOT SUPPORTED BY TCM310: Enable / Disable transmission of additional subtelegram info to the external host */
  //CO_WR_SUBTEL,

  CO_WR_MEM = 18, // Write data to device memory
  CO_RD_MEM = 19, // Read data from device memory
  CO_RD_MEM_ADDRESS = 20, // Read address and length of the configuration area and the Smart Ack Table
  // CO_RD_SECURITY, // DEPRECATED Read own security information (level, key)
  // CO_WR_SECURITY, // DEPRECATED Write own security information (level, key)
  // CO_WR_LEARNMODE, // Enable / disable learn mode
  // CO_RD_LEARNMODE, // Read learn mode status
  // CO_WR_SECUREDEVICE_ADD, // DEPRECATED Add a secure device
  // CO_WR_SECUREDEVICE_DEL, // Delete a secure device from the link table
  // CO_RD_SECUREDEVICE_BY_INDEX, // DEPRECATED Read secure device by index
  // CO_WR_MODE, // Set the gateway transceiver mode
  // CO_RD_NUMSECUREDEVICES, // Read number of secure devices in the secure link table
  // CO_RD_SECUREDEVICE_BY_ID, // Read information about a specific secure device from the secure link table using the device ID
  // CO_WR_SECUREDEVICE_ADD_PSK, // Add Pre-shared key for inbound secure device
  // CO_WR_SECUREDEVICE_SENDTEACHIN, // Send Secure Teach-In message
  // CO_WR_TEMPORARY_RLC_WINDOW, // Set a temporary rolling-code window for every taught-in device
  // CO_RD_SECUREDEVICE_PSK, // Read PSK
  CO_RD_DUTYCYCLE_LIMIT, // Read the status of the duty cycle limit monitor
  // CO_SET_BAUDRATE, // Set the baud rate used to communicate with the external host
  // CO_GET_FREQUENCY_INFO, // Read the radio frequency and protocol supported by the device
  // CO_GET_STEPCODE = 39, // Read Hardware Step code and Revision of the Device
  // // 40 - 45 reserved
  // CO_WR_REMAN_CODE = 46, // Set the security code to unlock Remote Management functionality via radio
  // CO_WR_STARTUP_DELAY, // Set the startup delay (time from power up until start of operation)
  // CO_WR_REMAN_REPEATING, // Select if REMAN telegrams originating from this module can be repeated
  // CO_RD_REMAN_REPEATING, // Check if REMAN telegrams originating from this module can be repeated
  // CO_SET_NOISETHRESHOLD, // Set the RSSI noise threshold level for telegram reception
  // CO_GET_NOISETHRESHOLD, // Read the RSSI noise threshold level for telegram reception
  // // 52/53 Reserved
  // CO_WR_RLC_SAVE_PERIOD = 54, // Set the period in which outgoing RLCs are saved to the EEPROM
  // CO_WR_RLC_LEGACY_MODE, // Activate the legacy RLC security mode allowing roll-over and using the RLC acceptance window for 24bit explicit RLC
  // CO_WR_SECUREDEVICEV2_ADD, // Add secure device to secure link table
  // CO_RD_SECUREDEVICEV2_BY_INDEX, // Read secure device from secure link table using the table index
  // CO_WR_RSSITEST_MODE, // Control the state of the RSSI-Test mode.
  // CO_RD_RSSITEST_MODE, // Read the state of the RSSI-Test Mode.
  // CO_WR_SECUREDEVICE_MAINTENANCEKEY, //Add the maintenance key information into the secure link table.
  // CO_RD_SECUREDEVICE_MAINTENANCEKEY, // Read by index the maintenance key information from the secure link table.
  // CO_WR_TRANSPARENT_MODE, // Control the state of the transparent mode.
  // CO_RD_TRANSPARENT_MODE, // Read the state of the transparent mode.
  // CO_WR_TX_ONLY_MODE, // Control the state of the TX only mode.
  // CO_RD_TX_ONLY_MODE // Read the state of the TX only mode.
}
