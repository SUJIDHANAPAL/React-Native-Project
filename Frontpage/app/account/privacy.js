import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Terms & Privacy Policy</Text>

      <Text style={styles.heading}>1. Introduction</Text>
      <Text style={styles.text}>
        Welcome to our app. By using our services, you agree to these Terms & Privacy Policy. Please read carefully.
      </Text>

      <Text style={styles.heading}>2. User Data</Text>
      <Text style={styles.text}>
        We collect certain personal information such as email, name, and usage data to provide and improve our services.
      </Text>

      <Text style={styles.heading}>3. Payment Information</Text>
      <Text style={styles.text}>
        Payment details are securely processed. Sensitive data such as card numbers are masked and not stored in full.
      </Text>

      <Text style={styles.heading}>4. Cookies and Tracking</Text>
      <Text style={styles.text}>
        We may use cookies or similar technologies to enhance user experience and analytics.
      </Text>

      <Text style={styles.heading}>5. Changes to Policy</Text>
      <Text style={styles.text}>
        We reserve the right to update these Terms & Privacy Policy at any time. Users will be notified of major changes.
      </Text>

      <Text style={styles.heading}>6. Contact Us</Text>
      <Text style={styles.text}>
        If you have any questions regarding this policy, please contact us via the Help & Support page.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  heading: { fontSize: 18, fontWeight: "bold", marginTop: 15, marginBottom: 5 },
  text: { fontSize: 14, color: "#444", lineHeight: 20 },
});
