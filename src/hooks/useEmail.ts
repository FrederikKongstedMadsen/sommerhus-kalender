import emailjs from "@emailjs/browser";
import type { Booking } from "../types/booking";

export const useEmail = () => {
  const sendEmail = (booking: Booking) => {
    // Format dates for display
    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleDateString("da-DK", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    };

    const startDateFormatted = formatDate(booking.startDate);
    const endDateFormatted = formatDate(booking.endDate);
    const dateRange =
      booking.startDate === booking.endDate
        ? startDateFormatted
        : `${startDateFormatted} - ${endDateFormatted}`;

    // Prepare template parameters for EmailJS
    const templateParams = {
      booking_name: booking.name,
      start_date: startDateFormatted,
      end_date: endDateFormatted,
      date_range: dateRange,
      booking_type: booking.type === "booking" ? "booking" : "ønsket",
      note: booking.note || "",
    };

    emailjs
      .send("service_74jqu7n", "template_a0j08rl", templateParams, {
        publicKey: "UBjye2vY7jpA3Ow1J",
      })
      .then(
        (result) => {
          console.log("Email sent successfully:", result.text);
        },
        (error) => {
          console.error("Error sending email:", error.text);
        }
      );
  };
  return { sendEmail };
};
