// Must be imported first, before anything touches @supabase/supabase-js —
// it relies on URL/URLSearchParams and crypto.getRandomValues, neither of
// which React Native's JS engine provides natively.
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
