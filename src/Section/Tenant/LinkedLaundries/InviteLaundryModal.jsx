import { Mail, Send } from "lucide-react";
import Modal from "../../../Components/UI/Modal";
import Button from "../../../Components/UI/Button";
import Input from "../../../Components/UI/Input";
import Alert from "../../../Components/UI/Alert";

const InviteLaundryModal = ({ isOpen, onClose, formik }) => {
  const isSubmitting = formik.isSubmitting;

  return (
    <Modal
      closeOnBackdrop={!isSubmitting}
      description="Send an invitation to a laundry company to join ClothSync."
      footer={
        <>
          <Button
            disabled={isSubmitting}
            onClick={onClose}
            size="sm"
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            form="invite-laundry-form"
            leftIcon={<Send size={18} />}
            loading={isSubmitting}
            size="sm"
            type="submit"
            variant="success"
          >
            {isSubmitting ? "Sending Invitation..." : "Send Invitation"}
          </Button>
        </>
      }
      onClose={isSubmitting ? undefined : onClose}
      open={isOpen}
      showCloseButton={!isSubmitting}
      title="Invite New Laundry"
    >
      <form
        aria-busy={isSubmitting}
        className="space-y-5"
        id="invite-laundry-form"
        onSubmit={formik.handleSubmit}
      >
        <Input
          disabled={isSubmitting}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email ? formik.errors.email : ""}
          label="Email Address"
          leftIcon={<Mail size={20} />}
          name="email"
          onBlur={formik.handleBlur}
          onChange={(value) => formik.setFieldValue("email", value)}
          placeholder="contact@laundry.com"
          type="email"
          value={formik.values.email}
        />

        <Alert variant="info">
          An email invitation will be sent to the contact. Once they accept,
          they'll appear in your Linked Laundries list.
        </Alert>
      </form>
    </Modal>
  );
};

export default InviteLaundryModal;
