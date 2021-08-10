// Project: enocean-core
// File: Manufacturers.ts
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

/**
 * Registered EnOcean device manufacturers.
 *
 * See e.g. https://www.enocean.com/fileadmin/redaktion/support/enocean-link/eo_manufacturer_8h.html .
 *
 */
//
export enum Manufacturers {
  Reserved = 0x000,
  PEHA = 0x001,
  THERMOKON = 0x002,
  SERVODAN = 0x003,
  ECHOFLEX_SOLUTIONS = 0x004,
  OMNIO_AG = 0x005,
  AWAG_ELEKTROTECHNIK_AG = 0x005,
  HARDMEIER_ELECTRONICS = 0x006,
  REGULVAR_INC = 0x007,
  AD_HOC_ELECTRONICS = 0x008,
  DISTECH_CONTROLS = 0x009,
  KIEBACK_AND_PETER = 0x00a,
  ENOCEAN_GMBH = 0x00b,
  PROBARE = 0x00c,
  VICOS_GMBH = 0x00c,
  ELTAKO = 0x00d,
  LEVITON = 0x00e,
  HONEYWELL = 0x00f,
  SPARTAN_PERIPHERAL_DEVICES = 0x010,
  SIEMENS = 0x011,
  T_MAC = 0x012,
  RELIABLE_CONTROLS_CORPORATION = 0x013,
  ELSNER_ELEKTRONIK_GMBH = 0x014,
  DIEHL_CONTROLS = 0x015,
  BSC_COMPUTER = 0x016,
  S_AND_S_REGELTECHNIK_GMBH = 0x017,
  ZENO_CONTROLS = 0x018,
  MASCO_CORPORATION = 0x018,
  INTESIS_SOFTWARE_SL = 0x019,
  VIESSMANN = 0x01a,
  LUTUO_TECHNOLOGY = 0x01b,
  CAN2GO = 0x01c,
  SAUTER = 0x01d,
  BOOT_UP = 0x01e,
  OSRAM_SYLVANIA = 0x01f,
  UNOTECH = 0x020,
  DELTA_CONTROLS_INC = 0x21,
  UNITRONIC_AG = 0x022,
  NANOSENSE = 0x023,
  THE_S4_GROUP = 0x024,
  MSR_SOLUTIONS = 0x025,
  VEISSMANN_HAUSATOMATION_GMBH = 0x025,
  GE = 0x26,
  MAICO = 0x027,
  RUSKIN_COMPANY = 0x28,
  MAGNUM_ENERGY_SOLUTIONS = 0x29,
  KMC_CONTROLS = 0x02a,
  ECOLOGIX_CONTROLS = 0x02b,
  TRIO_2_SYS = 0x2c,
  AFRISO_EURO_INDEX = 0x02d,
  WALDMANN_GMBH = 0x02e,
  NEC_PLATFORMS_LTD = 0x030,
  ITEC_CORPORATION = 0x031,
  SIMICX_CO_LTD = 0x32,
  PERMUNDO_GMBH = 0x33,
  EUROTRONIC_TECHNOLOGY_GMBH = 0x34,
  ART_JAPAN_CO_LTD = 0x35,
  TIANSU_AUTOMATION_CONTROL_SYSTE_CO_LTD = 0x36,
  WEINZIERL_ENGINEERING_GMBH = 0x37,
  GRUPPO_GIORDANO_IDEA_SPA = 0x38,
  ALPHAEOS_AG = 0x39,
  TAG_TECHNOLOGIES = 0x3a,
  WATTSTOPPER = 0x3b,
  PRESSAC_COMMUNICATIONS_LTD = 0x3c,
  GIGA_CONCEPT = 0x3e,
  SENSORTEC = 0x3f,
  JAEGER_DIREKT = 0x40,
  AIR_SYSTEM_COMPONENTS_INC = 0x41,
  ERMINE_CORP = 0x042,
  SODA_GMBH = 0x043,
  EKE_AUTOMATION = 0x044,
  HOLTER_REGELARMUTREN = 0x045,
  ID_RF = 0x046,
  DEUTA_CONTROLS_GMBH = 0x047,
  EWATTCH = 0x048,
  MICROPELT = 0x049,
  CALEFFI_SPA = 0x04a,
  DIGITAL_CONCEPTS = 0x04b,
  EMERSON_CLIMATE_TECHNOLOGIES = 0x04c,
  ADEE_ELECTRONIC = 0x04d,
  ALTECON = 0x04e,
  NANJING_PUTIAN_TELECOMMUNICATIONS = 0x04f,
  TERRALUX = 0x050,
  MENRED = 0x051,
  IEXERGY_GMBH = 0x052,
  OVENTROP_GMBH = 0x053,
  BUILDING_AUTOMATION_PRODUCTS_INC = 0x054,
  FUNCTIONAL_DEVICES_INC = 0x055,
  OGGA = 0x056,
  ITHO_DAALDEROP = 0x057,
  RESOL = 0x058,
  ADVANCED_DEVICES = 0x059,
  AUTANI_LCC = 0x05a,
  DR_RIEDEL_GMBH = 0x05b,
  HOPPE_HOLDING_AG = 0x05c,
  SIEGENIA_AUBI_KG = 0x05d,
  ADEO_SERVICES = 0x05e,
  EIMSIG_EFP_GMBH = 0x05f,
  VIMAR_SPA = 0x060,
  GLEN_DIMLAX_GMBH = 0x061,
  PMDM_GMBH = 0x062,
  HUBBEL_LIGHTNING = 0x063,
  DEBFLEX = 0x64,
  PERIFACTORY_SENSORSYSTEMS = 0x65,
  WATTY_CORP = 0x66,
  WAGO_KONTAKTTECHNIK = 0x67,
  KESSEL = 0x68,
  AUG_WINKHAUS = 0x69,
  DECELECT = 0x6a,
  MST_INDUSTRIES = 0x6b,
  BECKER_ANTRIEBE = 0x6c,
  NEXELEC = 0x6d,
  WIELAND_ELECTRIC = 0x6e,
  AVIDSEN = 0x6f,
  CWS_BOCO_INTERNATIONAL = 0x70,
  ROTO_FRANK = 0x71,
  ALM_CONTORLS = 0x072,
  TOMMASO_TECHNOLOGIES = 0x073,
  REHAU = 0x074,
  MULTI_USER_MANUFACTURER = 0x7ff,
}
