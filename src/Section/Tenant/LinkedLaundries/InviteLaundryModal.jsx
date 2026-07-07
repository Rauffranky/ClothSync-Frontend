import { Mail, Send } from "lucide-react";
import Modal from "../../../Components/UI/Modal";
import Button from "../../../Components/UI/Button";
import Input from "../../../Components/UI/Input";
import Alert from "../../../Components/UI/Alert";

const InviteLaundryModal = ({ isOpen, onClose, formik }) => {
  return (
    <Modal
      description="Send an invitation to a laundry company to join ClothSync."
      footer={
        <>
          <Button onClick={onClose} size="sm" variant="secondary">
            Cancel
          </Button>
          <Button
            variant="success"
            form="invite-laundry-form"
            leftIcon={<Send size={18} />}
            size="sm"
            type="submit"
          >
            Send Invitation
          </Button>
        </>
      }
      onClose={onClose}
      open={isOpen}
      title="Invite New Laundry"
    >
      <form
        className="space-y-5"
        id="invite-laundry-form"
        onSubmit={formik.handleSubmit}
      >
        <Input
          error={
            formik.touched.email &&
            Boolean(formik.errors.email)
          }
          helperText={
            formik.touched.email
              ? formik.errors.email
              : ""
          }
          label="Email Address"
          leftIcon={<Mail size={20} />}
          name="email"
          onBlur={formik.handleBlur}
          onChange={(value) =>
            formik.setFieldValue("email", value)
          }
          placeholder="contact@laundry.com"
          required
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
