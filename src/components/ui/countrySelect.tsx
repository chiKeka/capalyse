import {
  CitySelect,
  CountrySelect,
  LanguageSelect,
  PhonecodeSelect,
  RegionSelect,
  StateSelect,
} from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";

type CustomCountryProps = {
  cityProps?: React.ComponentProps<typeof CitySelect>;
  countryProps?: React.ComponentProps<typeof CountrySelect>;
  stateProps?: React.ComponentProps<typeof StateSelect>;
  languageProps?: React.ComponentProps<typeof LanguageSelect>;
  regionProps?: React.ComponentProps<typeof RegionSelect>;
  phoneProps?: React.ComponentProps<typeof PhonecodeSelect>;
};

export const CustomCountry = ({
  cityProps,
  countryProps,
  stateProps,
  languageProps,
  regionProps,
  phoneProps,
}: CustomCountryProps) => {
  return (
    <>
      {countryProps && <CountrySelect {...countryProps} />}
      {stateProps && <StateSelect {...stateProps} />}
      {cityProps && <CitySelect {...cityProps} />}
      {languageProps && <LanguageSelect {...languageProps} />}
      {regionProps && <RegionSelect {...regionProps} />}
      {phoneProps && <PhonecodeSelect {...phoneProps} />}
    </>
  );
};
