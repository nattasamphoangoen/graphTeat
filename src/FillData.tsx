import { useState, FormEvent } from "react";

interface BackupData {
  name: string;
  date: string;
  size: string;
  status: string;
}

const FillData = () => {
  const [backupList, setBackupList] = useState<BackupData[]>([]);
  const [formData, setFormData] = useState<BackupData>({
    name: "",
    date: "",
    size: "",
    status: "Pending",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setBackupList([...backupList, formData]);
    setFormData({
      name: "",
      date: "",
      size: "",
      status: "Pending",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="backup-container">
      <h2>Backup Data Form</h2>
      <form onSubmit={handleSubmit} className="backup-form">
        <div className="form-group">
          <label htmlFor="name">Backup Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            className="input"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="Enter backup name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Date:</label>
          <input
            className="input date-input"
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="size">Size (GB):</label>
          <input
            type="text"
            id="size"
            name="size"
            className="input"
            value={formData.size}
            onChange={handleInputChange}
            required
            placeholder="Enter size in GB"
          />
        </div>

        <button type="submit" className="submit-btn">
          Add Backup
        </button>
      </form>

      {backupList.length > 0 && (
        <div className="backup-display">
          <h3>Entered Backup Data</h3>
          <div className="backup-grid">
            <div className="backup-header">
              <div>Name</div>
              <div>Date</div>
              <div>Size</div>
              <div>Status</div>
            </div>
            {backupList.map((backup, index) => (
              <div key={index} className="backup-row">
                <div>{backup.name}</div>
                <div>{backup.date}</div>
                <div>{backup.size} GB</div>
                <div className="status">{backup.status}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FillData;
